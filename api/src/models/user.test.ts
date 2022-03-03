import { expect } from 'chai';
import { describe } from 'mocha';
import { ProjectParticipantObject, UserObject } from './user';

describe('ProjectParticipantObject', () => {
  describe('No values provided', () => {
    let data: ProjectParticipantObject;

    before(() => {
      data = new ProjectParticipantObject((null as unknown) as any);
    });

    it('sets project_id', function () {
      expect(data.project_id).to.equal(undefined);
    });

    it('sets name', function () {
      expect(data.name).to.equal(undefined);
    });

    it('sets system_user_id', function () {
      expect(data.system_user_id).to.equal(undefined);
    });

    it('sets project_role_id', function () {
      expect(data.project_role_id).to.equal(undefined);
    });

    it('sets project_role_name', function () {
      expect(data.project_role_name).to.equal(undefined);
    });

    it('sets project_participation_id', function () {
      expect(data.project_participation_id).to.equal(undefined);
    });
  });

  describe('valid values provided', () => {
    let data: ProjectParticipantObject;

    const participantObject = {
      project_id: 1,
      project_name: 'name',
      system_user_id: 2,
      project_role_id: 3,
      project_role_name: 'role',
      project_participation_id: 4
    };

    before(() => {
      data = new ProjectParticipantObject(participantObject);
    });

    it('sets project_id', function () {
      expect(data.project_id).to.equal(1);
    });

    it('sets name', function () {
      expect(data.name).to.equal('name');
    });

    it('sets system_user_id', function () {
      expect(data.system_user_id).to.equal(2);
    });

    it('sets project_role_id', function () {
      expect(data.project_role_id).to.equal(3);
    });

    it('sets project_role_name', function () {
      expect(data.project_role_name).to.equal('role');
    });

    it('sets project_participation_id', function () {
      expect(data.project_participation_id).to.equal(4);
    });
  });
});

describe('UserObject', () => {
  describe('No values provided', () => {
    let data: UserObject;

    before(() => {
      data = new UserObject((null as unknown) as any);
    });

    it('sets id', function () {
      expect(data.id).to.equal(undefined);
    });

    it('sets user_identifier', function () {
      expect(data.user_identifier).to.equal(undefined);
    });

    it('sets role_names', function () {
      expect(data.role_names).to.eql([]);
    });
  });

  describe('valid values provided, no roles', () => {
    let data: UserObject;

    const userObject = { system_user_id: 1, user_identifier: 'test name', role_ids: [], role_names: [] };

    before(() => {
      data = new UserObject(userObject);
    });

    it('sets id', function () {
      expect(data.id).to.equal(1);
    });

    it('sets user_identifier', function () {
      expect(data.user_identifier).to.equal('test name');
    });

    it('sets role_ids', function () {
      expect(data.role_ids).to.eql([]);
    });

    it('sets role_names', function () {
      expect(data.role_names).to.eql([]);
    });
  });

  describe('valid values provided', () => {
    let data: UserObject;

    const userObject = {
      system_user_id: 1,
      user_identifier: 'test name',
      role_ids: [1, 2],
      role_names: ['role 1', 'role 2']
    };

    before(() => {
      data = new UserObject(userObject);
    });

    it('sets id', function () {
      expect(data.id).to.equal(1);
    });

    it('sets user_identifier', function () {
      expect(data.user_identifier).to.equal('test name');
    });

    it('sets role_ids', function () {
      expect(data.role_ids).to.eql([1, 2]);
    });

    it('sets role_names', function () {
      expect(data.role_names).to.eql(['role 1', 'role 2']);
    });
  });
});
