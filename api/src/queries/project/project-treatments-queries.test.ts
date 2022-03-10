import { expect } from 'chai';
import { Feature } from 'geojson';
import { describe } from 'mocha';
import {
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
  it('returns null response when null  provided', () => {
    const response = postTreatmentUnitSQL(
      (null as unknown) as number,
      (null as unknown) as number,
      (null as unknown) as Feature['properties'],
      (null as unknown) as Feature['geometry']
    );

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId and other data provided', () => {
    const featureObj = {
      type: 'Feature',
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
        Treatment_: 1,
        Width_m: 240,
        Length_m: 3498,
        Reconnaiss: 'Y',
        Leave_for_: 'N',
        Treatment1: 'Tree bending; Tree felling; Seeding',
        FEATURE_TY: 'Transect',
        ROAD_ID: 0,
        SHAPE_Leng: 3498.988939
      }
    } as Feature;

    const response = postTreatmentUnitSQL(1, 1, featureObj.properties, featureObj.geometry);

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
    const response = getTreatmentDataYearExistSQL((null as unknown) as number, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid treatmentUnitId provided', () => {
    const response = getTreatmentDataYearExistSQL(1, 1);

    expect(response).to.not.be.null;
  });
});
