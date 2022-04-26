import { expect } from 'chai';
import { describe } from 'mocha';
import {
  deleteContactSQL,
  deleteIndigenousPartnershipsSQL,
  deleteIUCNSQL,
  deletePermitSQL,
  deleteProjectFundingSourceSQL,
  deleteProjectRangeSQL,
  deleteProjectRegionSQL,
  deleteProjectSpatialSQL,
  deleteProjectSpeciesSQL,
  deleteProjectSQL,
  deleteStakeholderPartnershipsSQL
} from './project-delete-queries';

describe('deleteIUCNSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteIUCNSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteIUCNSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deletePermitSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deletePermitSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deletePermitSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteIndigenousPartnershipsSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteIndigenousPartnershipsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteIndigenousPartnershipsSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteStakeholderPartnershipsSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteStakeholderPartnershipsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteStakeholderPartnershipsSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteProjectSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteProjectSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteProjectFundingSourceSQL', () => {
  it('returns null response when null pfsId (project funding source) provided', () => {
    const response = deleteProjectFundingSourceSQL((null as unknown) as number, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteProjectFundingSourceSQL(1, 1);

    expect(response).to.not.be.null;
  });
});

describe('deleteContactSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteContactSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteContactSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteProjectSpatialSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteProjectSpatialSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteProjectSpatialSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteProjectRegionSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteProjectRegionSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteProjectRegionSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteProjectRangeSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteProjectRangeSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteProjectRangeSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteProjectSpeciesSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteProjectSpeciesSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteProjectSpeciesSQL(1);

    expect(response).to.not.be.null;
  });
});
