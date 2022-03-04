import { expect } from 'chai';
import { describe } from 'mocha';
import {
  GetContactData,
  GetFundingData,
  GetIUCNClassificationData,
  GetLocationData,
  GetPartnershipsData,
  GetPermitData,
  GetProjectData,
  GetSpeciesData
} from './project-view';

describe('GetPartnershipsData', () => {
  describe('No values provided', () => {
    let data: GetPartnershipsData;

    before(() => {
      data = new GetPartnershipsData((null as unknown) as any[], (null as unknown) as any[]);
    });

    it('sets indigenous_partnerships', function () {
      expect(data.indigenous_partnerships).to.eql([]);
    });

    it('sets stakeholder_partnerships', function () {
      expect(data.stakeholder_partnerships).to.eql([]);
    });
  });

  describe('Empty arrays as values provided', () => {
    let data: GetPartnershipsData;

    before(() => {
      data = new GetPartnershipsData([], []);
    });

    it('sets indigenous_partnerships', function () {
      expect(data.indigenous_partnerships).to.eql([]);
    });

    it('sets stakeholder_partnerships', function () {
      expect(data.stakeholder_partnerships).to.eql([]);
    });
  });

  describe('indigenous_partnerships values provided', () => {
    let data: GetPartnershipsData;

    const indigenous_partnerships = [{ first_nations_id: 1 }, { first_nations_id: 2 }];
    const stakeholder_partnerships: string[] = [];

    before(() => {
      data = new GetPartnershipsData(indigenous_partnerships, stakeholder_partnerships);
    });

    it('sets indigenous_partnerships', function () {
      expect(data.indigenous_partnerships).to.eql([1, 2]);
    });

    it('sets stakeholder_partnerships', function () {
      expect(data.stakeholder_partnerships).to.eql([]);
    });
  });

  describe('stakeholder_partnerships values provided', () => {
    let data: GetPartnershipsData;

    const indigenous_partnerships: string[] = [];
    const stakeholder_partnerships = [{ name: 'partner 1' }, { name: 'partner 2' }];

    before(() => {
      data = new GetPartnershipsData(indigenous_partnerships, stakeholder_partnerships);
    });

    it('sets indigenous_partnerships', function () {
      expect(data.indigenous_partnerships).to.eql([]);
    });

    it('sets stakeholder_partnerships', function () {
      expect(data.stakeholder_partnerships).to.eql(['partner 1', 'partner 2']);
    });
  });

  describe('All values provided', () => {
    let data: GetPartnershipsData;

    const indigenous_partnerships = [{ first_nations_id: 1 }, { first_nations_id: 2 }];
    const stakeholder_partnerships = [{ name: 'partner 3' }, { name: 'partner 4' }];

    before(() => {
      data = new GetPartnershipsData(indigenous_partnerships, stakeholder_partnerships);
    });

    it('sets indigenous_partnerships', function () {
      expect(data.indigenous_partnerships).to.eql([1, 2]);
    });

    it('sets stakeholder_partnerships', function () {
      expect(data.stakeholder_partnerships).to.eql(['partner 3', 'partner 4']);
    });
  });
});

describe('GetIUCNClassificationData', () => {
  describe('No values provided', () => {
    it('sets classification details', function () {
      const iucnClassificationData = new GetIUCNClassificationData((null as unknown) as any[]);

      expect(iucnClassificationData.classificationDetails).to.eql([]);
    });
  });

  describe('Empty array as values provided', () => {
    it('sets classification details', function () {
      const iucnClassificationData = new GetIUCNClassificationData([]);

      expect(iucnClassificationData.classificationDetails).to.eql([]);
    });
  });

  describe('All values provided', () => {
    it('sets classification details', function () {
      const iucnClassificationDataObj = [
        {
          classification: 'class',
          subclassification1: 'subclass1',
          subclassification2: 'subclass2'
        }
      ];

      const iucnClassificationData = new GetIUCNClassificationData(iucnClassificationDataObj);

      expect(iucnClassificationData.classificationDetails).to.eql([
        {
          classification: 'class',
          subClassification1: 'subclass1',
          subClassification2: 'subclass2'
        }
      ]);
    });
  });
});

describe('GetContactData', () => {
  describe('No values provided', () => {
    let projectContactData: GetContactData;

    before(() => {
      projectContactData = new GetContactData((null as unknown) as any[]);
    });

    it('sets contacts', function () {
      expect(projectContactData.contacts).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let projectContactData: GetContactData;

    const contacts = [
      {
        first_name: 'first',
        last_name: 'last',
        email_address: 'email@example.com',
        agency: 'agency',
        is_public: 'Y',
        is_primary: 'Y'
      }
    ];

    before(() => {
      projectContactData = new GetContactData(contacts);
    });

    it('sets permits', function () {
      expect(projectContactData.contacts).to.eql([
        {
          first_name: 'first',
          last_name: 'last',
          email_address: 'email@example.com',
          agency: 'agency',
          is_public: 'true',
          is_primary: 'true'
        }
      ]);
    });
  });
});

describe('GetSpeciesData', () => {
  describe('No values provided', () => {
    let data: GetSpeciesData;

    const obj: any[] = [];

    before(() => {
      data = new GetSpeciesData(obj);
    });

    it('sets focal species', function () {
      expect(data.focal_species).to.eql([]);
    });

    it('sets focal species names', function () {
      expect(data.focal_species_names).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let data: GetSpeciesData;

    const obj = [
      {
        wldtaxonomic_units_id: 1,
        english_name: 'english1',
        unit_name1: 'unit11',
        unit_name2: 'unit12',
        unit_name3: 'unit13'
      },
      {
        wldtaxonomic_units_id: 2,
        english_name: 'english2',
        unit_name1: 'unit21',
        unit_name2: '',
        unit_name3: ''
      }
    ];

    before(() => {
      data = new GetSpeciesData(obj);
    });

    it('sets focal species', function () {
      expect(data.focal_species).to.eql([1, 2]);
    });

    it('sets focal species names', function () {
      expect(data.focal_species_names).to.eql(['english1 - unit11 - unit12 - unit13', 'english2 - unit21']);
    });
  });
});

describe('GetLocationData', () => {
  describe('No values provided', () => {
    let locationData: GetLocationData;

    before(() => {
      locationData = new GetLocationData();
    });

    it('sets geometry, region and range', function () {
      expect(locationData.geometry).to.eql([]);
      expect(locationData.region).to.eql('');
      expect(locationData.range).to.eql(undefined);
    });
  });

  describe('Empty array values provided', () => {
    let locationData: GetLocationData;

    before(() => {
      locationData = new GetLocationData([], [], []);
    });

    it('sets geometry, region and range', function () {
      expect(locationData.geometry).to.eql([]);
      expect(locationData.region).to.eql('');
      expect(locationData.range).to.eql(undefined);
    });
  });

  describe('All values provided', () => {
    let locationData: GetLocationData;

    const geometry = [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [125.6, 10.1]
        },
        properties: {
          name: 'Dinagat Islands'
        }
      }
    ];

    const locationDataObj = [
      {
        geojson: geometry
      },
      {
        geojson: []
      }
    ];

    const regionDataObj = [
      {
        objectid: 1
      },
      {
        objectid: []
      }
    ];

    const rangeDataObj = [
      {
        caribou_population_unit_id: 1
      },
      {
        caribou_population_unit_id: []
      }
    ];

    before(() => {
      locationData = new GetLocationData(locationDataObj, regionDataObj, rangeDataObj);
    });

    it('sets the geometry, region and range', function () {
      expect(locationData.geometry).to.eql(geometry);
      expect(locationData.region).to.eql(1);
      expect(locationData.range).to.eql(1);
    });
  });
});

describe('GetProjectData', () => {
  describe('No values provided', () => {
    let data: GetProjectData;

    before(() => {
      data = new GetProjectData();
    });

    it('sets name', () => {
      expect(data.project_name).to.equal('');
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(null);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(null);
    });
  });

  describe('all values provided', () => {
    const projectData = {
      name: 'project name',
      type: 4,
      start_date: '2020-04-20T07:00:00.000Z',
      end_date: '2020-05-20T07:00:00.000Z',
      revision_count: 1
    };

    let data: GetProjectData;

    before(() => {
      data = new GetProjectData(projectData);
    });

    it('sets name', () => {
      expect(data.project_name).to.equal(projectData.name);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal('2020-04-20T07:00:00.000Z');
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal('2020-05-20T07:00:00.000Z');
    });
  });
});

describe('GetPermitData', () => {
  describe('No values provided', () => {
    let projectPermitData: GetPermitData;

    before(() => {
      projectPermitData = new GetPermitData((null as unknown) as any[]);
    });

    it('sets permits', function () {
      expect(projectPermitData.permits).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let projectPermitData: GetPermitData;

    const permits = [
      {
        number: '1',
        type: 'permit type'
      }
    ];

    before(() => {
      projectPermitData = new GetPermitData(permits);
    });

    it('sets permits', function () {
      expect(projectPermitData.permits).to.eql([
        {
          permit_number: '1',
          permit_type: 'permit type'
        }
      ]);
    });
  });
});

describe('GetFundingData', () => {
  describe('No values provided', () => {
    let fundingData: GetFundingData;

    before(() => {
      fundingData = new GetFundingData((null as unknown) as any[]);
    });

    it('sets project funding sources', function () {
      expect(fundingData.fundingSources).to.eql([]);
    });
  });

  describe('No length for funding data provided', () => {
    let fundingData: GetFundingData;

    before(() => {
      fundingData = new GetFundingData([]);
    });

    it('sets project funding sources', function () {
      expect(fundingData.fundingSources).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let fundingData: GetFundingData;

    const fundingDataObj = [
      {
        id: 1,
        agency_id: '1',
        agency_name: 'Agency name',
        agency_project_id: 'Agency123',
        investment_action_category: 'Investment',
        investment_action_category_name: 'Investment name',
        start_date: '01/01/2020',
        end_date: '01/01/2021',
        funding_amount: 123,
        revision_count: 0
      }
    ];

    before(() => {
      fundingData = new GetFundingData(fundingDataObj);
    });

    it('sets project funding sources', function () {
      expect(fundingData.fundingSources).to.eql(fundingDataObj);
    });
  });
});
