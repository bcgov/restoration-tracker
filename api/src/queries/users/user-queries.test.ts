import { expect } from 'chai';
import { describe } from 'mocha';
import {
  activateSystemUserSQL,
  addSystemUserSQL,
  deactivateSystemUserSQL,
  deleteAllProjectRolesSQL,
  deleteAllSystemRolesSQL,
  getUserByIdSQL,
  getUserByUserIdentifierSQL,
  getUserListSQL
} from './user-queries';

describe('getUserByUserIdentifierSQL', () => {
  it('returns sql query string', () => {
    const response = getUserByUserIdentifierSQL('aUserName', 'anIdentitySource');

    expect(response).to.not.be.null;
  });
});

describe('getUserByIdSQL', () => {
  it('returns sql query string', () => {
    const response = getUserByIdSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getUserListSQL', () => {
  it('returns the expected response', () => {
    const response = getUserListSQL();

    expect(response).to.not.be.null;
  });
});

describe('addSystemUserSQL', () => {
  it('returns sql query string', () => {
    const response = addSystemUserSQL('userGuid', 'validString', 'validString');

    expect(response).to.not.be.null;
  });
});

describe('deactivateSystemUserSQL', () => {
  it('returns sql query string', () => {
    const response = deactivateSystemUserSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('activateSystemUserSQL', () => {
  it('returns sql query string', () => {
    const response = activateSystemUserSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteAllSystemRolesSQL', () => {
  it('returns sql query string', () => {
    const response = deleteAllSystemRolesSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteAllProjectRolesSQL', () => {
  it('returns sql query string', () => {
    const response = deleteAllProjectRolesSQL(1);

    expect(response).to.not.be.null;
  });
});
