import { render } from '@testing-library/react';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import FundingSource from './FundingSource';
jest.mock('../../../../hooks/useRestorationTrackerApi');
const mockRefresh = jest.fn();

describe('FundingSource', () => {
  it('renders component correctly', () => {
    const { getByTestId } = render(
      <FundingSource projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    );

    expect(getByTestId('FundingSourceTitle')).toBeVisible();
  });

  it('renders data correctly', async () => {
    const { getByTestId } = render(
      <FundingSource
        projectForViewData={{
          ...getProjectForViewResponse,
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
          }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(getByTestId('fundingData')).toBeInTheDocument();
  });

  it('renders correctly with no funding', () => {
    const { getByTestId } = render(
      <FundingSource
        projectForViewData={{
          ...getProjectForViewResponse,
          funding: {
            fundingSources: []
          }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(getByTestId('NoFundingLoaded')).toBeVisible();
  });
});
