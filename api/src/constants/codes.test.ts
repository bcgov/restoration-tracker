import { expect } from 'chai';
import { describe } from 'mocha';
import { coordinator_agency, regional_offices } from './codes';

describe('coordinator_agency', () => {
  it('has values', () => {
    expect(coordinator_agency).is.not.empty;
  });
});

describe('regional_offices', () => {
  it('has values', () => {
    expect(regional_offices).is.not.empty;
  });
});
