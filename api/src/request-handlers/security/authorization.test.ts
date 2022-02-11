import chai, { expect } from 'chai';
import { Request } from 'express';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../constants/roles';
import { KnexDBConnection } from '../../database/knex-db';
import { ApiError, HTTPError } from '../../errors/custom-error';
import { ProjectUserObject, UserObject } from '../../models/user';
import project_participation_queries from '../../queries/project-participation';
import {
  AuthorizationScheme,
  AuthorizationService,
  AuthorizeByProjectRoles,
  AuthorizeBySystemRoles,
  AuthorizeRule
} from '../../services/authorization-service';
import { UserService } from '../../services/user-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import * as authorization from './authorization';

chai.use(sinonChai);

describe('authorizeRequestHandler', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('throws a 403 error if the user is not authorized', async function () {
    getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    sinon.stub(authorization, 'authorizeRequest').resolves(false);

    const mockAuthorizationSchemeCallback = () => {
      return { or: [] };
    };

    const requestHandler = authorization.authorizeRequestHandler(mockAuthorizationSchemeCallback);

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (error) {
      expect((error as HTTPError).message).to.equal('Access Denied');
      expect((error as HTTPError).status).to.equal(403);
    }

    expect(mockNext).not.to.have.been.called;
  });

  it('calls next if the user is authorized', async function () {
    getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    sinon.stub(authorization, 'authorizeRequest').resolves(true);

    const mockAuthorizationSchemeCallback = () => {
      return { or: [] };
    };

    const requestHandler = authorization.authorizeRequestHandler(mockAuthorizationSchemeCallback);

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockNext).to.have.been.calledOnce;
  });
});

describe('authorizeRequest', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns false if systemUserObject is null', async function () {
    getMockDBConnection();

    const mockSystemUserObject = (undefined as unknown) as UserObject;
    sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockSystemUserObject);

    const mockReq = ({ authorization_scheme: {} } as unknown) as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(false);
  });

  it('returns true if the user is a system administrator', async function () {
    getMockDBConnection();

    const mockSystemUserObject = ({ role_names: [] } as unknown) as UserObject;
    sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockSystemUserObject);

    sinon.stub(AuthorizationService.prototype, 'authorizeSystemAdministrator').resolves(true);

    const mockReq = ({ authorization_scheme: {} } as unknown) as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(true);
  });

  it('returns true if the authorization_scheme is undefined', async function () {
    getMockDBConnection();

    const mockSystemUserObject = ({ role_names: [] } as unknown) as UserObject;
    sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockSystemUserObject);

    sinon.stub(AuthorizationService.prototype, 'authorizeSystemAdministrator').resolves(false);

    const mockReq = ({ authorization_scheme: undefined } as unknown) as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(true);
  });

  it('returns true if the user is authorized against the authorization_scheme', async function () {
    getMockDBConnection();

    const mockSystemUserObject = ({ role_names: [] } as unknown) as UserObject;
    sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockSystemUserObject);

    sinon.stub(AuthorizationService.prototype, 'authorizeSystemAdministrator').resolves(false);

    sinon.stub(AuthorizationService.prototype, 'executeAuthorizationScheme').resolves(true);

    const mockReq = ({ authorization_scheme: {} } as unknown) as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(true);
  });

  it('returns false if the user is not authorized against the authorization_scheme', async function () {
    getMockDBConnection();

    const mockSystemUserObject = ({ role_names: [] } as unknown) as UserObject;
    sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockSystemUserObject);

    sinon.stub(AuthorizationService.prototype, 'authorizeSystemAdministrator').resolves(false);

    sinon.stub(AuthorizationService.prototype, 'executeAuthorizationScheme').resolves(false);

    const mockReq = ({ authorization_scheme: {} } as unknown) as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(false);
  });

  it('returns false if an error is thrown', async function () {
    getMockDBConnection({
      open: () => {
        throw new Error('Test Error');
      }
    });

    const mockReq = ({ authorization_scheme: {} } as unknown) as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(false);
  });
});

describe('executeAuthorizationScheme', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns false if any AND authorizationScheme rules return false', async function () {
    const mockAuthorizationScheme = ({ and: [] } as unknown) as AuthorizationScheme;
    const mockDBConnection = getMockDBConnection();

    sinon.stub(AuthorizationService.prototype, 'executeAuthorizeConfig').resolves([true, false, true]);

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    const isAuthorized = await authorizationService.executeAuthorizationScheme(mockAuthorizationScheme);

    expect(isAuthorized).to.equal(false);
  });

  it('returns true if all AND authorizationScheme rules return true', async function () {
    const mockAuthorizationScheme = ({ and: [] } as unknown) as AuthorizationScheme;
    const mockDBConnection = getMockDBConnection();

    sinon.stub(AuthorizationService.prototype, 'executeAuthorizeConfig').resolves([true, true, true]);

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    const isAuthorized = await authorizationService.executeAuthorizationScheme(mockAuthorizationScheme);

    expect(isAuthorized).to.equal(true);
  });

  it('returns false if all OR authorizationScheme rules return false', async function () {
    const mockAuthorizationScheme = ({ or: [] } as unknown) as AuthorizationScheme;
    const mockDBConnection = getMockDBConnection();

    sinon.stub(AuthorizationService.prototype, 'executeAuthorizeConfig').resolves([false, false, false]);

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    const isAuthorized = await authorizationService.executeAuthorizationScheme(mockAuthorizationScheme);

    expect(isAuthorized).to.equal(false);
  });

  it('returns true if any OR authorizationScheme rules return true', async function () {
    const mockAuthorizationScheme = ({ or: [] } as unknown) as AuthorizationScheme;
    const mockDBConnection = getMockDBConnection();

    sinon.stub(AuthorizationService.prototype, 'executeAuthorizeConfig').resolves([false, true, false]);

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    const isAuthorized = await authorizationService.executeAuthorizationScheme(mockAuthorizationScheme);

    expect(isAuthorized).to.equal(true);
  });
});

describe('executeAuthorizeConfig', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns an array of authorizeRule results', async function () {
    const mockAuthorizeRules: AuthorizeRule[] = [
      {
        validSystemRoles: [SYSTEM_ROLE.PROJECT_CREATOR],
        discriminator: 'SystemRole'
      },
      {
        validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
        projectId: 1,
        discriminator: 'ProjectRole'
      },
      {
        discriminator: 'SystemUser'
      }
    ];
    const mockDBConnection = getMockDBConnection();

    sinon.stub(AuthorizationService.prototype, 'authorizeBySystemRole').resolves(true);
    sinon.stub(AuthorizationService.prototype, 'authorizeByProjectRole').resolves(false);
    sinon.stub(AuthorizationService.prototype, 'authorizeBySystemUser').resolves(true);

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    const authorizeResults = await authorizationService.executeAuthorizeConfig(mockAuthorizeRules);

    expect(authorizeResults).to.eql([true, false, true]);
  });
});

describe('authorizeBySystemRole', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns false if `authorizeSystemRoles` is null', async function () {
    const mockAuthorizeSystemRoles = (null as unknown) as AuthorizeBySystemRoles;
    const mockDBConnection = getMockDBConnection();

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    const isAuthorizedBySystemRole = await authorizationService.authorizeBySystemRole(mockAuthorizeSystemRoles);

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns false if `systemUserObject` is null', async function () {
    const mockAuthorizeSystemRoles: AuthorizeBySystemRoles = {
      validSystemRoles: [SYSTEM_ROLE.PROJECT_CREATOR],
      discriminator: 'SystemRole'
    };
    const mockDBConnection = getMockDBConnection();

    const mockGetSystemUsersObjectResponse = (null as unknown) as UserObject;
    sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockGetSystemUsersObjectResponse);

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    const isAuthorizedBySystemRole = await authorizationService.authorizeBySystemRole(mockAuthorizeSystemRoles);

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns true if `authorizeSystemRoles` specifies no valid roles', async function () {
    const mockAuthorizeSystemRoles: AuthorizeBySystemRoles = {
      validSystemRoles: [],
      discriminator: 'SystemRole'
    };
    const mockDBConnection = getMockDBConnection();

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection, {
      systemUser: ({} as unknown) as UserObject
    });

    const isAuthorizedBySystemRole = await authorizationService.authorizeBySystemRole(mockAuthorizeSystemRoles);

    expect(isAuthorizedBySystemRole).to.equal(true);
  });

  it('returns false if the user does not have any valid roles', async function () {
    const mockAuthorizeSystemRoles: AuthorizeBySystemRoles = {
      validSystemRoles: [SYSTEM_ROLE.PROJECT_CREATOR],
      discriminator: 'SystemRole'
    };
    const mockDBConnection = getMockDBConnection();

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection, {
      systemUser: ({ role_names: [] } as unknown) as UserObject
    });

    const isAuthorizedBySystemRole = await authorizationService.authorizeBySystemRole(mockAuthorizeSystemRoles);

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns true if the user has at least one of the valid roles', async function () {
    const mockAuthorizeSystemRoles: AuthorizeBySystemRoles = {
      validSystemRoles: [SYSTEM_ROLE.PROJECT_CREATOR],
      discriminator: 'SystemRole'
    };
    const mockDBConnection = getMockDBConnection();

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection, {
      systemUser: ({ role_names: [SYSTEM_ROLE.PROJECT_CREATOR] } as unknown) as UserObject
    });

    const isAuthorizedBySystemRole = await authorizationService.authorizeBySystemRole(mockAuthorizeSystemRoles);

    expect(isAuthorizedBySystemRole).to.equal(true);
  });
});

describe('authorizeByProjectRole', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns false if `authorizeByProjectRole` is null', async function () {
    const mockAuthorizeProjectRoles = (null as unknown) as AuthorizeByProjectRoles;
    const mockDBConnection = getMockDBConnection();

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    const isAuthorizedBySystemRole = await authorizationService.authorizeByProjectRole(mockAuthorizeProjectRoles);

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns false if `authorizeProjectRoles.projectId` is null', async function () {
    const mockAuthorizeProjectRoles: AuthorizeByProjectRoles = {
      validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
      projectId: (null as unknown) as number,
      discriminator: 'ProjectRole'
    };
    const mockDBConnection = getMockDBConnection();

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    const isAuthorizedBySystemRole = await authorizationService.authorizeByProjectRole(mockAuthorizeProjectRoles);

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns true if `authorizeByProjectRole` specifies no valid roles', async function () {
    const mockAuthorizeProjectRoles: AuthorizeByProjectRoles = {
      validProjectRoles: [],
      projectId: 1,
      discriminator: 'ProjectRole'
    };
    const mockDBConnection = getMockDBConnection();

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    const isAuthorizedBySystemRole = await authorizationService.authorizeByProjectRole(mockAuthorizeProjectRoles);

    expect(isAuthorizedBySystemRole).to.equal(true);
  });

  it('returns false if it fails to fetch the users project role information', async function () {
    const mockAuthorizeProjectRoles: AuthorizeByProjectRoles = {
      validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
      projectId: 1,
      discriminator: 'ProjectRole'
    };
    const mockDBConnection = getMockDBConnection();

    const mockProjectUserObject = (undefined as unknown) as ProjectUserObject;
    sinon.stub(AuthorizationService.prototype, 'getProjectUserObject').resolves(mockProjectUserObject);

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    const isAuthorizedBySystemRole = await authorizationService.authorizeByProjectRole(mockAuthorizeProjectRoles);

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns false if the user does not have any valid roles', async function () {
    const mockAuthorizeProjectRoles: AuthorizeByProjectRoles = {
      validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
      projectId: 1,
      discriminator: 'ProjectRole'
    };
    const mockDBConnection = getMockDBConnection();

    sinon
      .stub(AuthorizationService.prototype, 'getProjectUserObject')
      .resolves(({ project_role_names: [] } as unknown) as ProjectUserObject);

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    const isAuthorizedBySystemRole = await authorizationService.authorizeByProjectRole(mockAuthorizeProjectRoles);

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns true if the user has at lest one of the valid roles', async function () {
    const mockAuthorizeProjectRoles: AuthorizeByProjectRoles = {
      validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
      projectId: 1,
      discriminator: 'ProjectRole'
    };
    const mockDBConnection = getMockDBConnection();

    sinon
      .stub(AuthorizationService.prototype, 'getProjectUserObject')
      .resolves(({ project_role_names: [PROJECT_ROLE.PROJECT_LEAD] } as unknown) as ProjectUserObject);

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    const isAuthorizedBySystemRole = await authorizationService.authorizeByProjectRole(mockAuthorizeProjectRoles);

    expect(isAuthorizedBySystemRole).to.equal(true);
  });
});

describe('authorizeBySystemUser', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns false if `systemUserObject` is null', async function () {
    const mockDBConnection = getMockDBConnection();

    const mockGetSystemUsersObjectResponse = (null as unknown) as UserObject;
    sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockGetSystemUsersObjectResponse);

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    const isAuthorizedBySystemRole = await authorizationService.authorizeBySystemUser();

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns true if `systemUserObject` is not null', async function () {
    const mockDBConnection = getMockDBConnection();

    const mockGetSystemUsersObjectResponse = (null as unknown) as UserObject;
    sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockGetSystemUsersObjectResponse);

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection, {
      systemUser: ({} as unknown) as UserObject
    });

    const isAuthorizedBySystemRole = await authorizationService.authorizeBySystemUser();

    expect(isAuthorizedBySystemRole).to.equal(true);
  });
});

describe('userHasValidRole', () => {
  describe('validSystemRoles is a string', () => {
    describe('userSystemRoles is a string', () => {
      it('returns true if the valid roles is empty', () => {
        const response = AuthorizationService.userHasValidRole('', '');

        expect(response).to.be.true;
      });

      it('returns false if the user has no roles', () => {
        const response = AuthorizationService.userHasValidRole('admin', '');

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = AuthorizationService.userHasValidRole('admin', 'user');

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = AuthorizationService.userHasValidRole('admin', 'admin');

        expect(response).to.be.true;
      });
    });

    describe('userSystemRoles is an array', () => {
      it('returns true if the valid roles is empty', () => {
        const response = AuthorizationService.userHasValidRole('', []);

        expect(response).to.be.true;
      });

      it('returns false if the user has no matching roles', () => {
        const response = AuthorizationService.userHasValidRole('admin', []);

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = AuthorizationService.userHasValidRole('admin', ['user']);

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = AuthorizationService.userHasValidRole('admin', ['admin']);

        expect(response).to.be.true;
      });
    });
  });

  describe('validSystemRoles is an array', () => {
    describe('userSystemRoles is a string', () => {
      it('returns true if the valid roles is empty', () => {
        const response = AuthorizationService.userHasValidRole([], '');

        expect(response).to.be.true;
      });

      it('returns false if the user has no roles', () => {
        const response = AuthorizationService.userHasValidRole(['admin'], '');

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = AuthorizationService.userHasValidRole(['admin'], 'user');

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = AuthorizationService.userHasValidRole(['admin'], 'admin');

        expect(response).to.be.true;
      });
    });

    describe('userSystemRoles is an array', () => {
      it('returns true if the valid roles is empty', () => {
        const response = AuthorizationService.userHasValidRole([], []);

        expect(response).to.be.true;
      });

      it('returns false if the user has no matching roles', () => {
        const response = AuthorizationService.userHasValidRole(['admin'], []);

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = AuthorizationService.userHasValidRole(['admin'], ['user']);

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = AuthorizationService.userHasValidRole(['admin'], ['admin']);

        expect(response).to.be.true;
      });
    });
  });
});

describe('getSystemUserObject', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('throws an HTTP500 error if fetching the system user throws an error', async function () {
    const mockDBConnection = getMockDBConnection();

    sinon.stub(AuthorizationService.prototype, 'getSystemUserWithRoles').callsFake(() => {
      throw new Error('Test Error');
    });

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    try {
      await authorizationService.getSystemUserObject();
      expect.fail();
    } catch (error) {
      expect((error as ApiError).message).to.equal('failed to get system user');
    }
  });

  it('throws an HTTP500 error if the system user is null', async function () {
    const mockDBConnection = getMockDBConnection();

    const mockSystemUserWithRolesResponse = null;
    sinon.stub(AuthorizationService.prototype, 'getSystemUserWithRoles').resolves(mockSystemUserWithRolesResponse);

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    try {
      await authorizationService.getSystemUserObject();
      expect.fail();
    } catch (error) {
      expect((error as ApiError).message).to.equal('system user was null');
    }
  });

  it('returns a `UserObject`', async function () {
    const mockDBConnection = getMockDBConnection();

    const mockSystemUserWithRolesResponse = new UserObject();
    sinon.stub(AuthorizationService.prototype, 'getSystemUserWithRoles').resolves(mockSystemUserWithRolesResponse);

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    const systemUserObject = await authorizationService.getSystemUserObject();

    expect(systemUserObject).to.equal(mockSystemUserWithRolesResponse);
  });
});

describe('getSystemUserWithRoles', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns null if the system user id is null', async function () {
    const mockDBConnection = getMockDBConnection({ systemUserId: () => (null as unknown) as number });

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    const result = await authorizationService.getSystemUserWithRoles();

    expect(result).to.be.null;
  });

  it('returns a UserObject', async function () {
    const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

    const mockUsersByIdSQLResponse = new UserObject();
    sinon.stub(UserService.prototype, 'getUserById').resolves(mockUsersByIdSQLResponse);

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    const result = await authorizationService.getSystemUserWithRoles();

    expect(result).to.equal(mockUsersByIdSQLResponse);
  });
});

describe('getProjectUserObject', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('throws an HTTP500 error if fetching the system user throws an error', async function () {
    const mockDBConnection = getMockDBConnection();

    sinon.stub(AuthorizationService.prototype, 'getProjectUserWithRoles').callsFake(() => {
      throw new Error('Test Error');
    });

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    try {
      await authorizationService.getProjectUserObject(1);
      expect.fail();
    } catch (error) {
      expect((error as ApiError).message).to.equal('failed to get project user');
    }
  });

  it('throws an HTTP500 error if the system user is null', async function () {
    const mockDBConnection = getMockDBConnection();

    const mockSystemUserWithRolesResponse = null;
    sinon.stub(AuthorizationService.prototype, 'getProjectUserWithRoles').resolves(mockSystemUserWithRolesResponse);

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    try {
      await authorizationService.getProjectUserObject(1);
      expect.fail();
    } catch (error) {
      expect((error as ApiError).message).to.equal('project user was null');
    }
  });

  it('returns a `ProjectUserObject`', async function () {
    const mockDBConnection = getMockDBConnection();

    const mockSystemUserWithRolesResponse = {};
    sinon.stub(AuthorizationService.prototype, 'getProjectUserWithRoles').resolves(mockSystemUserWithRolesResponse);

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    const systemUserObject = await authorizationService.getProjectUserObject(1);

    expect(systemUserObject).to.be.instanceOf(ProjectUserObject);
  });
});

describe('getProjectUserWithRoles', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns null if the system user id is null', async function () {
    const mockDBConnection = getMockDBConnection({ systemUserId: () => (null as unknown) as number });

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    const result = await authorizationService.getProjectUserWithRoles(1);

    expect(result).to.be.null;
  });

  it('returns null if the get user by id SQL statement is null', async function () {
    const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

    const mockUsersByIdSQLResponse = null;
    sinon
      .stub(project_participation_queries, 'getProjectParticipationBySystemUserSQL')
      .returns(mockUsersByIdSQLResponse);

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    const result = await authorizationService.getProjectUserWithRoles(1);

    expect(result).to.be.null;
  });

  it('returns the first row of the response', async function () {
    const mockResponseRow = { 'Test Column': 'Test Value' };
    const mockQueryResponse = ({ rowCount: 1, rows: [mockResponseRow] } as unknown) as QueryResult<any>;
    const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

    const mockUsersByIdSQLResponse = SQL`Test SQL Statement`;
    sinon
      .stub(project_participation_queries, 'getProjectParticipationBySystemUserSQL')
      .returns(mockUsersByIdSQLResponse);

    const authorizationService = new AuthorizationService((mockDBConnection as unknown) as KnexDBConnection);

    const result = await authorizationService.getProjectUserWithRoles(1);

    expect(result).to.eql(mockResponseRow);
  });
});
