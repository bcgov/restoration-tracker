import { render } from '@testing-library/react';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectDetails from './GeneralInformation';

jest.mock('../../../../hooks/useRestorationTrackerApi');

const mockRefresh = jest.fn();

describe('ProjectDetails', () => {
  it('renders component correctly ', () => {
    const { getByTestId } = render(
      <ProjectDetails projectForViewData={{ ...getProjectForViewResponse }} codes={codes} refresh={mockRefresh} />
    );

    expect(getByTestId('general_info_component')).toBeVisible();
  });

  it('renders correctly with no end date (only start date)', () => {
    const { getByText } = render(
      <ProjectDetails
        projectForViewData={{
          ...getProjectForViewResponse,
          project: { ...getProjectForViewResponse.project, end_date: (null as unknown) as string }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(getByText('---')).toBeVisible();
  });

  it('renders correctly with end date', () => {
    const { getByText } = render(
      <ProjectDetails
        projectForViewData={{
          ...getProjectForViewResponse,
          project: { ...getProjectForViewResponse.project, end_date: '2021-01-26' as string }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(getByText('Jan 26, 2021')).toBeVisible();
  });
});
