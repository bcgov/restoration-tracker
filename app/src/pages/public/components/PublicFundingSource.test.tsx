import { render } from '@testing-library/react';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import PublicFundingSource from './PublicFundingSource';

const mockRefresh = jest.fn();

describe('PublicFundingSource', () => {
  it('renders correctly with no data', () => {
    const projectPermitData = {
      funding: {}
    } as IGetProjectForViewResponse;

    const { getByText } = render(<PublicFundingSource projectForViewData={projectPermitData} refresh={mockRefresh} />);

    expect(getByText('No Funding Sources')).toBeVisible();
  });

  it('renders correctly', () => {
    const projectPermitData = {
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
            start_date: '2021-01-10',
            end_date: '2021-01-20',
            revision_count: 1
          }
        ]
      }
    } as IGetProjectForViewResponse;

    const { getByText } = render(
      <PublicFundingSource projectForViewData={projectPermitData} refresh={mockRefresh} />
    );

    expect(getByText('agency name', {exact: false})).toBeVisible();
    expect(getByText('$333', {exact: false})).toBeVisible();
    expect(getByText('ABC123', {exact: false})).toBeVisible();
    expect(getByText('Jan 10, 2021', {exact: false})).toBeVisible();
    expect(getByText('Jan 20, 2021', {exact: false})).toBeVisible();
  });
});
