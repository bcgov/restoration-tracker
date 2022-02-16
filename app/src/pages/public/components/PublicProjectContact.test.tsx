import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicProjectContact from './PublicProjectContact';

const mockRefresh = jest.fn();

describe('PublicProjectContact', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <PublicProjectContact projectForViewData={getProjectForViewResponse} refresh={mockRefresh} />
    );

    expect(getByTestId('projectContactTitle')).toBeVisible();
  });
});
