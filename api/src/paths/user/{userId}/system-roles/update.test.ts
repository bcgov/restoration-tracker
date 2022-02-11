import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { HTTPError } from '../../../../errors/custom-error';
import { UserService } from '../../../../services/user-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import * as system_roles from './update';

chai.use(sinonChai);

describe('updateSystemRolesHandler', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when missing required path param: userId', async () => {
    getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      userId: ''
    };
    mockReq.body = {
      roles: [1]
    };

    try {
      const requestHandler = system_roles.updateSystemRolesHandler();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param: userId');
    }
  });

  it('should throw a 400 error when missing roles in request body', async () => {
    getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      userId: '1'
    };
    mockReq.body = {
      roles: null
    };

    try {
      const requestHandler = system_roles.updateSystemRolesHandler();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required body param: roles');
    }
  });

  it('should throw a 400 error when no system user found', async () => {
    getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      userId: '1'
    };
    mockReq.body = {
      roles: [1]
    };

    sinon.stub(UserService.prototype, 'getUserById').resolves(null);

    try {
      const requestHandler = system_roles.updateSystemRolesHandler();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to get system user');
    }
  });

  it('re-throws the error thrown by UserService.deleteUserSystemRoles', async () => {
    getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      userId: '1'
    };
    mockReq.body = {
      roles: [1]
    };

    sinon.stub(UserService.prototype, 'getUserById').resolves({
      id: 1,
      user_identifier: 'test name',
      record_end_date: '',
      role_ids: [11, 22],
      role_names: ['role 11', 'role 22']
    });

    sinon.stub(UserService.prototype, 'deleteUserSystemRoles').rejects(new Error('a delete error'));

    try {
      const requestHandler = system_roles.updateSystemRolesHandler();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('a delete error');
    }
  });

  it('re-throws the error thrown by UserService.addUserSystemRoles', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      userId: '1'
    };
    mockReq.body = {
      roles: [1]
    };

    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({ rows: [], rowCount: 1 });
    mockQuery.onCall(1).resolves(null);

    getMockDBConnection({
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(UserService.prototype, 'getUserById').resolves({
      id: 1,
      user_identifier: 'test name',
      record_end_date: '',
      role_ids: [11, 22],
      role_names: ['role 11', 'role 22']
    });

    sinon.stub(UserService.prototype, 'deleteUserSystemRoles').resolves();
    sinon.stub(UserService.prototype, 'addUserSystemRoles').rejects(new Error('an add error'));

    try {
      const requestHandler = system_roles.updateSystemRolesHandler();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('an add error');
    }
  });

  it('should send a 200 on success (when user has existing roles)', async () => {
    getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      userId: '1'
    };
    mockReq.body = {
      roles: [1]
    };

    sinon.stub(UserService.prototype, 'getUserById').resolves({
      id: 1,
      user_identifier: 'test name',
      record_end_date: '',
      role_ids: [11, 22],
      role_names: ['role 1', 'role 2']
    });

    const deleteUserSystemRolesStub = sinon.stub(UserService.prototype, 'deleteUserSystemRoles').resolves();
    sinon.stub(UserService.prototype, 'addUserSystemRoles').resolves();

    const requestHandler = system_roles.updateSystemRolesHandler();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(deleteUserSystemRolesStub).to.have.been.calledOnce;
    expect(mockRes.statusValue).to.equal(200);
  });

  it('should send a 200 on success (when user does not have existing roles)', async () => {
    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      userId: '1'
    };
    mockReq.body = {
      roles: [1]
    };

    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rowCount: 1
    });

    getMockDBConnection({
      query: mockQuery
    });

    sinon
      .stub(UserService.prototype, 'getUserById')
      .resolves({ id: 1, user_identifier: 'test name', record_end_date: '', role_ids: [], role_names: [] });

    const deleteUserSystemRolesStub = sinon.stub(UserService.prototype, 'deleteUserSystemRoles').resolves();
    sinon.stub(UserService.prototype, 'addUserSystemRoles').resolves();

    const requestHandler = system_roles.updateSystemRolesHandler();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(deleteUserSystemRolesStub).not.to.have.been.called;
    expect(mockRes.statusValue).to.equal(200);
  });
});
