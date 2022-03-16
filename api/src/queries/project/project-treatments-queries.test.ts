import { expect } from 'chai';
import { describe } from 'mocha';
import { SQLStatement } from 'sql-template-strings';
import { TreatmentFeature } from '../../models/project-treatment';
import {
  deleteProjectTreatmentsByYearSQL,
  deleteProjectTreatmentUnitIfNoTreatmentsSQL,
  deleteProjectTreatmentUnitSQL,
  getProjectTreatmentsSQL,
  getTreatmentDataYearExistSQL,
  getTreatmentFeatureTypesSQL,
  getTreatmentUnitExistSQL,
  getTreatmentUnitTypesSQL,
  postTreatmentDataSQL,
  postTreatmentTypeSQL,
  postTreatmentUnitSQL
} from './project-treatments-queries';

describe('getTreatmentFeatureTypesSQL', () => {
  it('Valid sql created', () => {
    const response = getTreatmentFeatureTypesSQL();

    expect(response).to.not.be.null;
  });
});

describe('getTreatmentUnitTypesSQL', () => {
  it('Valid sql created', () => {
    const response = getTreatmentUnitTypesSQL();

    expect(response).to.not.be.null;
  });
});

describe('postTreatmentUnitSQL', () => {
  it('returns non null response when valid projectId and other data provided', () => {
    const treatmentFeatureObj = {
      geometry: {
        bbox: [-122.46204108416048, 58.44944100517593, -122.44525166669784, 58.479595787093686],
        type: 'LineString',
        coordinates: [
          [-122.44525166669784, 58.479595787093665],
          [-122.46204108416048, 58.44944100517593]
        ]
      },
      properties: {
        OBJECTID: 1,
        SHAPE_Leng: 3498.988939,
        TU_ID: 1,
        Width_m: 240,
        Length_m: 3498,
        Area_ha: 10,
        Recon: 'Y',
        Treatments: 'Tree bending; Tree felling; Seeding',
        Type: 'Transect',
        Descript: 'something',
        Implement: 'Y',
        Year: '2020'
      }
    } as TreatmentFeature;

    const response = postTreatmentUnitSQL(1, 1, treatmentFeatureObj);

    expect(response).to.not.be.null;
  });
});

describe('postTreatmentDataSQL', () => {
  it('returns null response when null  provided', () => {
    const response = postTreatmentDataSQL((null as unknown) as number, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid treatmentUnitId provided', () => {
    const response = postTreatmentDataSQL(1, 1);

    expect(response).to.not.be.null;
  });
});

describe('postTreatmentTypeSQL', () => {
  it('returns null response when null  provided', () => {
    const response = postTreatmentTypeSQL((null as unknown) as number, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid treatmentId provided', () => {
    const response = postTreatmentTypeSQL(1, 1);

    expect(response).to.not.be.null;
  });
});

describe('getTreatmentUnitExistSQL', () => {
  it('returns null response when null  provided', () => {
    const response = getTreatmentUnitExistSQL(
      (null as unknown) as number,
      (null as unknown) as number,
      (null as unknown) as number
    );

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = getTreatmentUnitExistSQL(1, 1, 1);

    expect(response).to.not.be.null;
  });
});

describe('getTreatmentDataYearExistSQL', () => {
  it('returns null response when null  provided', () => {
    const response = getTreatmentDataYearExistSQL((null as unknown) as number, (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns non null response when valid treatmentUnitId provided', () => {
    const response = getTreatmentDataYearExistSQL(1, '1');

    expect(response).to.not.be.null;
  });
});

describe('getProjectTreatmentsSQL', () => {
  it('returns null response when null  provided', () => {
    const response = getProjectTreatmentsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid treatmentUnitId provided', () => {
    const response = getProjectTreatmentsSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteProjectTreatmentUnitSQL', () => {
  it('returns a sql statement', () => {
    const response = deleteProjectTreatmentUnitSQL(1, 1);

    expect(response).instanceof(SQLStatement);
  });
});

describe('deleteProjectTreatmentsByYearSQL', () => {
  it('returns a sql statement', () => {
    const response = deleteProjectTreatmentsByYearSQL(1, 1);

    expect(response).instanceof(SQLStatement);
  });
});

describe('deleteProjectTreatmentUnitIfNoTreatmentsSQL', () => {
  it('returns a sql statement', () => {
    const response = deleteProjectTreatmentUnitIfNoTreatmentsSQL();

    expect(response).instanceof(SQLStatement);
  });
});
