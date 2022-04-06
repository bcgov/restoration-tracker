import { expect } from 'chai';
import { describe } from 'mocha';
import { coordinator_agency } from './codes';

describe('coordinator_agency', () => {
  it('has values', () => {
    expect(coordinator_agency).is.not.empty;
  });
});
