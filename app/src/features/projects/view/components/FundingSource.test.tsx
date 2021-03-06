import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import FundingSource from './FundingSource';

const mockRefresh = jest.fn();

describe('FundingSource', () => {
  it('renders correctly with 1 funding source', () => {
    const { getByText } = render(
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
                start_date: '2021-01-10',
                end_date: '2021-01-20',
                revision_count: 1
              }
            ]
          }
        }}
        refresh={mockRefresh}
      />
    );

    expect(getByText('agency name', { exact: false })).toBeVisible();
    expect(getByText('$333', { exact: false })).toBeVisible();
    expect(getByText('ABC123', { exact: false })).toBeVisible();
    expect(getByText('Jan 10, 2021', { exact: false })).toBeVisible();
    expect(getByText('Jan 20, 2021', { exact: false })).toBeVisible();
  });

  it('renders correctly with no funding sources', () => {
    const { getByTestId } = render(
      <FundingSource
        projectForViewData={{
          ...getProjectForViewResponse,
          funding: {
            fundingSources: []
          }
        }}
        refresh={mockRefresh}
      />
    );

    expect(getByTestId('no_funding_sources')).toBeVisible();
  });
});
