import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicIUCNClassification from './PublicIUCNClassification';

const mockRefresh = jest.fn();

describe('PublicIUCNClassification', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <PublicIUCNClassification projectForViewData={getProjectForViewResponse} refresh={mockRefresh} />
    );

    expect(getByTestId('IUCNTitle')).toBeVisible();
    expect(getByTestId('IUCNData')).toBeVisible();
  });
});
