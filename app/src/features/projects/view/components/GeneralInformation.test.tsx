import { render } from '@testing-library/react';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import GeneralInformation from './GeneralInformation';

const mockRefresh = jest.fn();

describe('GeneralInformation', () => {
  it('renders correctly with no end date', () => {
    const projectPermitData = {
      project: {
        project_id: 1,
        project_name: 'Test Project Name',
        start_date: '2021-01-10',
        end_date: '',
        publish_date: '2021-01-26',
        objectives: 'Project objectives'
      },
      species: {
        focal_species_names: ['species1', 'species2']
      },
      location: {
        region: 123
      }
    } as IGetProjectForViewResponse;

    const codes = {
      regions: [
        {
          id: 1,
          name: 'region1'
        },
        { id: 2, name: 'region2' }
      ]
    } as IGetAllCodeSetsResponse;

    const { getByText } = render(
      <GeneralInformation projectForViewData={projectPermitData} codes={codes} refresh={mockRefresh} />
    );

    expect(getByText('Test Project Name', { exact: false })).toBeVisible();
    expect(getByText('Jan 10, 2021', { exact: false })).toBeVisible();
    expect(getByText('---', { exact: false })).toBeVisible();
    expect(getByText('species1', { exact: false })).toBeVisible();
  });

  it('renders correctly', () => {
    const projectPermitData = {
      project: {
        project_id: 1,
        project_name: 'Test Project Name',
        start_date: '2021-01-10',
        end_date: '2021-01-26',
        publish_date: '2021-01-26',
        objectives: 'Project objectives'
      },
      species: {
        focal_species_names: ['species1', 'species2']
      },
      location: {
        region: 123
      }
    } as IGetProjectForViewResponse;

    const codes = {
      regions: [
        {
          id: 1,
          name: 'region1'
        },
        { id: 2, name: 'region2' }
      ]
    } as IGetAllCodeSetsResponse;

    const { getByText } = render(
      <GeneralInformation projectForViewData={projectPermitData} codes={codes} refresh={mockRefresh} />
    );

    expect(getByText('Test Project Name', { exact: false })).toBeVisible();
    expect(getByText('Jan 10, 2021', { exact: false })).toBeVisible();
    expect(getByText('Jan 26, 2021', { exact: false })).toBeVisible();
    expect(getByText('species1', { exact: false })).toBeVisible();
  });
});
