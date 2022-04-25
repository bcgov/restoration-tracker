import { expect } from 'chai';
import { describe } from 'mocha';
import { getPublicProjectListSQL } from './project-queries';

describe('getPublicProjectListSQL', () => {
  it('returns non null response when called', () => {
    const response = getPublicProjectListSQL();

    expect(response).to.not.be.null;
  });
});
