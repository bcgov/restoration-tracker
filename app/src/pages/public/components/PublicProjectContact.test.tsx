import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicProjectCoordinator from './PublicProjectContact';

const mockRefresh = jest.fn();

describe('PublicProjectCoordinator', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <PublicProjectCoordinator projectForViewData={getProjectForViewResponse} refresh={mockRefresh} />
    );

    expect(getByTestId('projectContactTitle')).toBeVisible();
  });
});
