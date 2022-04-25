import { expect } from 'chai';
import { describe } from 'mocha';
import { PutProjectData } from '../../models/project-update';
import {
  getIndigenousPartnershipsByProjectSQL,
  getIUCNActionClassificationByProjectSQL,
  getPermitsByProjectSQL,
  putProjectSQL,
  updateProjectPublishStatusSQL
} from './project-update-queries';

describe('getIndigenousPartnershipsByProjectSQL', () => {
  it('Null projectId', () => {
    const response = getIndigenousPartnershipsByProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('valid projectId', () => {
    const response = getIndigenousPartnershipsByProjectSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getPermitsByProjectSQL', () => {
  it('Null projectId', () => {
    const response = getPermitsByProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('valid projectId', () => {
    const response = getPermitsByProjectSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getIUCNActionClassificationByProjectSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getIUCNActionClassificationByProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = getIUCNActionClassificationByProjectSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('putProjectSQL', () => {
  it('returns null when an invalid projectId is provided', () => {
    const response = putProjectSQL((null as unknown) as number, null, 1);

    expect(response).to.be.null;
  });

  it('returns null when a valid projectId but no data to update is provided', () => {
    const response = putProjectSQL(1, null, 1);

    expect(response).to.be.null;
  });

  it('returns valid sql when only project data is provided', () => {
    const response = putProjectSQL(
      1,
      new PutProjectData({
        name: 'project name',
        type: 1,
        start_date: '2020-04-20T07:00:00.000Z',
        end_date: '2020-05-20T07:00:00.000Z'
      }),
      1
    );

    expect(response).to.not.be.null;
  });
});

describe('updateProjectPublishStatusSQL', () => {
  describe('with invalid parameters', () => {
    it('returns null when project is null', () => {
      const response = updateProjectPublishStatusSQL((null as unknown) as number, true);

      expect(response).to.be.null;
    });
  });

  describe('with valid parameters', () => {
    it('returns a SQLStatement when there is a real date value', () => {
      const response = updateProjectPublishStatusSQL(1, true);

      expect(response).to.not.be.null;
      expect(response?.values).to.deep.include(1);
    });

    it('returns a SQLStatement when the date value is null', () => {
      const response = updateProjectPublishStatusSQL(1, false);

      expect(response).to.not.be.null;
      expect(response?.values).to.deep.include(1);
    });
  });
});
