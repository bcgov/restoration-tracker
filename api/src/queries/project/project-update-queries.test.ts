import { expect } from 'chai';
import { describe } from 'mocha';
import { PutProjectData } from '../../models/project-update';
import { putProjectSQL } from './project-update-queries';

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
