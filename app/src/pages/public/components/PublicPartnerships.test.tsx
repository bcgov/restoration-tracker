import { render } from '@testing-library/react';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import PublicPartnerships from './PublicPartnerships';

const mockRefresh = jest.fn();

describe('PublicPartnerships', () => {
  it('renders correctly with no data', () => {
    const projectPermitData = {
      partnerships: {}
    } as IGetProjectForViewResponse;

    const { getByText } = render(<PublicPartnerships projectForViewData={projectPermitData} refresh={mockRefresh} />);

    expect(getByText('None')).toBeVisible();
    expect(getByText('No Other Partnerships')).toBeVisible();
  });

  it('renders correctly', () => {
    const projectPermitData = {
      partnerships: {
        indigenous_partnerships: [0, 1],
        stakeholder_partnerships: ['partner2', 'partner3']
      }
    } as IGetProjectForViewResponse;

    const { getByText } = render(<PublicPartnerships projectForViewData={projectPermitData} refresh={mockRefresh} />);

    expect(getByText('0', { exact: false })).toBeVisible();
    expect(getByText('1', { exact: false })).toBeVisible();
    expect(getByText('partner2', { exact: false })).toBeVisible();
    expect(getByText('partner3', { exact: false })).toBeVisible();
  });
});
