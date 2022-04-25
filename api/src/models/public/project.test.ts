import { expect } from 'chai';
import { describe } from 'mocha';
import { GetPublicProjectData } from './project';

describe('GetPublicProjectData', () => {
  describe('No values provided', () => {
    let data: GetPublicProjectData;

    before(() => {
      data = new GetPublicProjectData();
    });

    it('sets name', () => {
      expect(data.project_name).to.equal('');
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal('');
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal('');
    });
  });

  describe('all values provided', () => {
    const projectData = {
      name: 'project name',
      type: 'type',
      start_date: '2020-04-20T07:00:00.000Z',
      end_date: '2020-05-20T07:00:00.000Z',
      revision_count: 1
    };

    let data: GetPublicProjectData;

    before(() => {
      data = new GetPublicProjectData(projectData);
    });

    it('sets name', () => {
      expect(data.project_name).to.equal(projectData.name);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal('2020-04-20T07:00:00.000Z');
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal('2020-05-20T07:00:00.000Z');
    });
  });
});
