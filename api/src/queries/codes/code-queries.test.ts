import { expect } from 'chai';
import { describe } from 'mocha';
import {
  getAdministrativeActivityStatusTypeSQL,
  getFirstNationsSQL,
  getFundingSourceSQL,
  getInvestmentActionCategorySQL,
  getIUCNConservationActionLevel1ClassificationSQL,
  getIUCNConservationActionLevel2SubclassificationSQL,
  getIUCNConservationActionLevel3SubclassificationSQL,
  getSystemRolesSQL
} from './code-queries';

describe('getFirstNationsSQL', () => {
  it('returns valid sql statement', () => {
    const response = getFirstNationsSQL();
    expect(response).to.not.be.null;
  });
});

describe('getFundingSourceSQL', () => {
  it('returns valid sql statement', () => {
    const response = getFundingSourceSQL();
    expect(response).to.not.be.null;
  });
});

describe('getInvestmentActionCategorySQL', () => {
  it('returns valid sql statement', () => {
    const response = getInvestmentActionCategorySQL();
    expect(response).to.not.be.null;
  });
});

describe('getIUCNConservationActionLevel1ClassificationSQL', () => {
  it('returns valid sql statement', () => {
    const response = getIUCNConservationActionLevel1ClassificationSQL();
    expect(response).to.not.be.null;
  });
});

describe('getIUCNConservationActionLevel2SubclassificationSQL', () => {
  it('returns valid sql statement', () => {
    const response = getIUCNConservationActionLevel2SubclassificationSQL();
    expect(response).to.not.be.null;
  });
});

describe('getIUCNConservationActionLevel3SubclassificationSQL', () => {
  it('returns valid sql statement', () => {
    const response = getIUCNConservationActionLevel3SubclassificationSQL();
    expect(response).to.not.be.null;
  });
});

describe('getSystemRolesSQL', () => {
  it('returns valid sql statement', () => {
    const response = getSystemRolesSQL();
    expect(response).to.not.be.null;
  });
});

describe('getAdministrativeActivityStatusTypeSQL', () => {
  it('returns valid sql statement', () => {
    const response = getAdministrativeActivityStatusTypeSQL();
    expect(response).to.not.be.null;
  });
});
