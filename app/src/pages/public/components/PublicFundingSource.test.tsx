import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicFundingSource from './PublicFundingSource';

const mockRefresh = jest.fn();

describe('PublicFundingSource', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <PublicFundingSource projectForViewData={getProjectForViewResponse} refresh={mockRefresh} />
    );

    expect(getByTestId("fundingSourcesTitle")).toBeVisible();
    expect(getByTestId("agencyTitle")).toBeVisible();
  });
});
