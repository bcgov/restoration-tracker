import { expect } from 'chai';
import { describe } from 'mocha';
import {
  GetContactData,
  GetIUCNClassificationData,
  GetLocationData,
  GetPartnershipsData,
  GetPermitData,
  GetProjectData
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

describe('GetLocationData', () => {
  describe('No values provided', () => {
    let locationData: GetLocationData;

    before(() => {
      locationData = new GetLocationData(null);
    });

    it('sets the geometry', function () {
      expect(locationData.geometry).to.eql([]);
    });
  });

  describe('Empty array values provided', () => {
    let locationData: GetLocationData;

    before(() => {
      locationData = new GetLocationData([]);
    });

    it('sets the geometry', function () {
      expect(locationData.geometry).to.eql([]);
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

    before(() => {
      locationData = new GetLocationData(locationDataObj);
    });

    it('sets the geometry', function () {
      expect(locationData.geometry).to.eql(geometry);
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
      expect(data.start_date).to.equal('');
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal('');
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
