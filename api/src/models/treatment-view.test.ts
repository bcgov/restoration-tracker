import { expect } from 'chai';
import { describe } from 'mocha';
import { GetTreatmentData } from '../models/treatment-view';

describe('GetTreatmentsData', () => {
  describe('No values provided', () => {
    let getTreatmentData: GetTreatmentData;

    before(() => {
      getTreatmentData = new GetTreatmentData([]);
    });

    it('sets treatmentList', function () {
      expect(getTreatmentData.treatmentList).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let getTreatmentData: GetTreatmentData;

    const sampleTreatmentList = [
      {
        id: '1',
        type: 'Other',
        width: 240,
        length: 3498,
        area: 839520,
        treatment_year: '2020',
        treatment_name: 'Seeding'
      },
      {
        id: '1',
        type: 'Other',
        width: 240,
        length: 3498,
        area: 839520,
        treatment_year: '2021',
        treatment_name: 'Tree Felling'
      }
    ];

    before(() => {
      getTreatmentData = new GetTreatmentData(sampleTreatmentList);
    });

    it('sets treatmentList', function () {
      expect(getTreatmentData.treatmentList).to.eql([
        {
          id: '1',
          type: 'Other',
          width: 240,
          length: 3498,
          area: 839520,
          treatments: [
            {
              treatment_year: '2020',
              treatment_name: 'Seeding'
            },
            {
              treatment_year: '2021',
              treatment_name: 'Tree Felling'
            }
          ]
        }
      ]);
    });
  });
});
