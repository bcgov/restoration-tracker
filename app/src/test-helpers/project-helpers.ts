import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';

export const getProjectForViewResponse: IGetProjectForViewResponse = {
  project: {
    project_id: 1,
    project_name: 'Test Project Name',
    start_date: '1998-10-10',
    end_date: '2021-02-26',
    completion_status: 'Active',
    publish_date: '2021-01-26',
    objectives: 'Project objectives',
    region: 'NRM Region 1',
    species: ['species1', 'species 2']
  },
  permit: {
    permits: [
      {
        permit_number: '123',
        permit_type: 'Permit type'
      }
    ]
  },
  location: {
    geometry: [],
    range: '1',
    priority: 'false'
  },
  coordinator: {
    first_name: 'Amanda',
    last_name: 'Christensen',
    email_address: 'amanda@christensen.com',
    coordinator_agency: 'Amanda and associates',
    share_contact_details: 'true'
  },
  iucn: {
    classificationDetails: [
      {
        classification: 1,
        subClassification1: 1,
        subClassification2: 1
      }
    ]
  },
  funding: {
    fundingSources: [
      {
        id: 0,
        agency_id: 1,
        agency_name: 'agency name',
        agency_project_id: 'ABC123',
        investment_action_category: 1,
        investment_action_category_name: 'investment action',
        funding_amount: 333,
        start_date: '2000-04-14',
        end_date: '2021-04-13',
        revision_count: 1
      }
    ]
  },
  partnerships: {
    indigenous_partnerships: [0, 1],
    stakeholder_partnerships: ['partner2', 'partner3']
  }
};
