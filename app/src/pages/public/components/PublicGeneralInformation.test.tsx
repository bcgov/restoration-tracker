import { render } from '@testing-library/react';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import PublicGeneralInformation from './PublicGeneralInformation';

const mockRefresh = jest.fn();

describe('PublicGeneralInformation', () => {
  it('renders correctly with no end date', () => {
    const projectPermitData = {
      project: {
        project_id: 1,
        project_name: 'Test Project Name',
        start_date: '2021-01-10',
        end_date: '',
        publish_date: '2021-01-26',
        objectives: 'Project objectives',
        region: 'NRM Region 1'
      }
    } as IGetProjectForViewResponse;

    const { getByText } = render(
      <PublicGeneralInformation projectForViewData={projectPermitData} refresh={mockRefresh} />
    );

    expect(getByText('Test Project Name', { exact: false })).toBeVisible();
    expect(getByText('Jan 10, 2021', { exact: false })).toBeVisible();
    expect(getByText('---', { exact: false })).toBeVisible();
  });

  it('renders correctly', () => {
    const projectPermitData = {
      project: {
        project_id: 1,
        project_name: 'Test Project Name',
        start_date: '2021-01-10',
        end_date: '2021-01-26',
        publish_date: '2021-01-26',
        objectives: 'Project objectives',
        region: 'NRM Region 1'
      }
    } as IGetProjectForViewResponse;

    const { getByText } = render(
      <PublicGeneralInformation projectForViewData={projectPermitData} refresh={mockRefresh} />
    );

    expect(getByText('Test Project Name', { exact: false })).toBeVisible();
    expect(getByText('Jan 10, 2021', { exact: false })).toBeVisible();
    expect(getByText('Jan 26, 2021', { exact: false })).toBeVisible();
  });
});
