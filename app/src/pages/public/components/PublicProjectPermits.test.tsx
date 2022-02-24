import { render } from '@testing-library/react';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import PublicProjectPermits from './PublicProjectPermits';

const mockRefresh = jest.fn();

describe('PublicProjectPermits', () => {
  it('renders correctly with no data', () => {
    const projectPermitData = {
      permit: {}
    } as IGetProjectForViewResponse;

    const { getByText } = render(<PublicProjectPermits projectForViewData={projectPermitData} refresh={mockRefresh} />);

    expect(getByText('No permits')).toBeVisible();
  });

  it('renders correctly', () => {
    const projectPermitData = {
      permit: {
        permits: [
          {
            permit_number: '123',
            permit_type: 'Permit type'
          }
        ]
      }
    } as IGetProjectForViewResponse;

    const { getByText } = render(
      <PublicProjectPermits projectForViewData={projectPermitData} refresh={mockRefresh} />
    );

    expect(getByText('123', {exact: false})).toBeVisible();
    expect(getByText('Permit type', {exact: false})).toBeVisible();
  });
});
