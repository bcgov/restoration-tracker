import { expect } from 'chai';
import { describe } from 'mocha';
import {
  addProjectRoleByRoleIdSQL,
  addProjectRoleByRoleNameSQL,
  deleteProjectParticipationSQL,
  getAllProjectParticipantsSQL,
  getAllUserProjectsSQL,
  getParticipantsFromAllSystemUsersProjectsSQL
} from './project-participation-queries';

describe('getAllUserProjectsSQL', () => {
  it('returns response when userId provided', () => {
    const response = getAllUserProjectsSQL(1);

    expect(response).not.to.be.null;
  });

  it('returns response when userId and projectId provided', () => {
    const response = getAllUserProjectsSQL(1, 1);

    expect(response).not.to.be.null;
  });
});

describe('getAllProjectParticipantsSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getAllProjectParticipantsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns null response when valid params provided', () => {
    const response = getAllProjectParticipantsSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('addProjectRoleByRoleNameSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = addProjectRoleByRoleNameSQL((null as unknown) as number, 2, 'role');

    expect(response).to.be.null;
  });

  it('returns null response when null systemUserId provided', () => {
    const response = addProjectRoleByRoleNameSQL(1, (null as unknown) as number, 'role');

    expect(response).to.be.null;
  });

  it('returns null response when null/empty projectParticipantRole provided', () => {
    const response = addProjectRoleByRoleNameSQL(1, 2, '');

    expect(response).to.be.null;
  });

  it('returns non null response when valid parameters provided', () => {
    const response = addProjectRoleByRoleNameSQL(1, 2, 'role');

    expect(response).to.not.be.null;
  });
});

describe('deleteProjectParticipationSQL', () => {
  it('returns null response when null projectParticipationId provided', () => {
    const response = deleteProjectParticipationSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid parameters provided', () => {
    const response = deleteProjectParticipationSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getParticipantsFromAllSystemUsersProjectsSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getParticipantsFromAllSystemUsersProjectsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = getParticipantsFromAllSystemUsersProjectsSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('addProjectRoleByRoleIdSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = addProjectRoleByRoleIdSQL(
      (null as unknown) as number,
      (null as unknown) as number,
      (null as unknown) as number
    );

    expect(response).to.be.null;
  });

  it('returns null response when null systemUserId provided', () => {
    const response = addProjectRoleByRoleIdSQL(1, (null as unknown) as number, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns null response when null projectParticipantRoleId provided', () => {
    const response = addProjectRoleByRoleIdSQL(1, 1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when null valid params provided', () => {
    const response = addProjectRoleByRoleIdSQL(1, 1, 1);

    expect(response).to.not.be.null;
  });
});
