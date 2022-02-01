import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicGeneralInformation from './PublicGeneralInformation';

const mockRefresh = jest.fn();

describe('PublicGeneralInformation', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <PublicGeneralInformation projectForViewData={getProjectForViewResponse} refresh={mockRefresh} />
    );

    expect(getByTestId('generalInfoTitle')).toBeVisible();
  });
});
