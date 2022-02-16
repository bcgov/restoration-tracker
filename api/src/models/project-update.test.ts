import { expect } from 'chai';
import { describe } from 'mocha';
import { PutFundingData, PutIUCNData, PutLocationData, PutPartnershipsData, PutProjectData } from './project-update';

describe('PutLocationData', () => {
  describe('No values provided', () => {
    let data: PutLocationData;

    before(() => {
      data = new PutLocationData(null);
    });

    it('sets geometry', () => {
      expect(data.geometry).to.eql([]);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.eql(null);
    });
  });

  describe('All values provided', () => {
    let data: PutLocationData;

    const obj = {
      geometry: [
        {
          type: 'Polygon',
          coordinates: [
            [
              [-128, 55],
              [-128, 55.5],
              [-128, 56],
              [-126, 58],
              [-128, 55]
            ]
          ],
          properties: {
            name: 'Restoration Islands'
          }
        }
      ],
      revision_count: 1
    };

    before(() => {
      data = new PutLocationData(obj);
    });

    it('sets geometry', () => {
      expect(data.geometry).to.eql(obj.geometry);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.eql(obj.revision_count);
    });
  });
});

describe('PutIUCNData', () => {
  describe('No values provided', () => {
    let data: PutIUCNData;

    before(() => {
      data = new PutIUCNData((null as unknown) as any[]);
    });

    it('sets classification details', () => {
      expect(data.classificationDetails).to.eql([]);
    });
  });

  describe('All values provided', () => {
    it('sets classification details', () => {
      const obj = {
        classificationDetails: [
          {
            classification: 1,
            subClassification1: 2,
            subClassification2: 2
          }
        ]
      };

      const data = new PutIUCNData(obj);

      expect(data.classificationDetails).to.eql([
        {
          classification: 1,
          subClassification1: 2,
          subClassification2: 2
        }
      ]);
    });
  });
});

describe('PutIUCNData', () => {
  describe('No values provided', () => {
    it('sets classification details', () => {
      const data = new PutIUCNData(null);

      expect(data.classificationDetails).to.eql([]);
    });
  });

  describe('All values provided', () => {
    it('sets classification details', () => {
      const obj = {
        classificationDetails: [
          {
            classification: 1,
            subClassification1: 2,
            subClassification2: 2
          }
        ]
      };

      const data = new PutIUCNData(obj);

      expect(data.classificationDetails).to.eql(obj.classificationDetails);
    });
  });
});

describe('PutPartnershipsData', () => {
  describe('No values provided', () => {
    let data: PutPartnershipsData;

    before(() => {
      data = new PutPartnershipsData(null);
    });

    it('sets indigenous_partnerships', () => {
      expect(data.indigenous_partnerships).to.eql([]);
    });

    it('sets stakeholder_partnerships', () => {
      expect(data.stakeholder_partnerships).to.eql([]);
    });
  });

  describe('all values provided', () => {
    const obj = {
      indigenous_partnerships: [1, 2],
      stakeholder_partnerships: ['partner 3', 'partner 4']
    };

    let data: PutPartnershipsData;

    before(() => {
      data = new PutPartnershipsData(obj);
    });

    it('sets indigenous_partnerships', () => {
      expect(data.indigenous_partnerships).to.eql(obj.indigenous_partnerships);
    });

    it('sets stakeholder_partnerships', () => {
      expect(data.stakeholder_partnerships).to.eql(obj.stakeholder_partnerships);
    });
  });
});

describe('PutProjectData', () => {
  describe('No values provided', () => {
    let data: PutProjectData;

    before(() => {
      data = new PutProjectData();
    });

    it('sets name', () => {
      expect(data.name).to.equal(null);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(null);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(null);
    });

    it('sets objectives', () => {
      expect(data.objectives).to.equal(null);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('all values provided', () => {
    const obj = {
      project_name: 'project name',
      start_date: '2020-04-20T07:00:00.000Z',
      end_date: '2020-05-20T07:00:00.000Z',
      revision_count: 1
    };

    let data: PutProjectData;

    before(() => {
      data = new PutProjectData(obj);
    });

    it('sets name', () => {
      expect(data.name).to.equal('project name');
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal('2020-04-20T07:00:00.000Z');
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal('2020-05-20T07:00:00.000Z');
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(1);
    });
  });
});

describe('PutFundingData', () => {
  describe('No values provided', () => {
    let data: PutFundingData;

    before(() => {
      data = new PutFundingData({ fundingSources: null });
    });

    it('sets funding sources', () => {
      expect(data.fundingSources[0]).to.equal(undefined);
    });
  });

  describe('All values provided', () => {
    let data: PutFundingData;

    before(() => {
      data = new PutFundingData({
        fundingSources: [
          {
            investment_action_category: 1,
            agency_project_id: 'agency project id',
            funding_amount: 20,
            start_date: '2020/04/04',
            end_date: '2020/05/05',
            revision_count: 1
          }
        ]
      });
    });

    it('sets investment_action_category', () => {
      expect(data.fundingSources[0].investment_action_category).to.equal(1);
    });

    it('sets agency_project_id', () => {
      expect(data.fundingSources[0].agency_project_id).to.equal('agency project id');
    });

    it('sets funding_amount', () => {
      expect(data.fundingSources[0].funding_amount).to.equal(20);
    });

    it('sets start_date', () => {
      expect(data.fundingSources[0].start_date).to.equal('2020/04/04');
    });

    it('sets end_date', () => {
      expect(data.fundingSources[0].end_date).to.equal('2020/05/05');
    });
  });
});
