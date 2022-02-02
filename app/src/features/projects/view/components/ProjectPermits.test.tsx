import { render } from '@testing-library/react';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectPermits from './ProjectPermits';

jest.mock('../../../../hooks/useRestorationTrackerApi');

const mockRefresh = jest.fn();

describe('ProjectPermits', () => {
  it('renders correctly with no permits', () => {
    const { getByTestId } = render(
      <ProjectPermits
        projectForViewData={{
          ...getProjectForViewResponse,
          permit: {
            permits: []
          }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(getByTestId('no_permits_loaded')).toBeVisible();
  });

  it('renders permits data correctly', async () => {
    const { getByTestId } = render(
      <ProjectPermits
        projectForViewData={{
          ...getProjectForViewResponse,
          permit: {
            permits: [
              {
                permit_number: '123',
                permit_type: 'Permit type'
              }
            ]
          }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(getByTestId('permit_item')).toBeInTheDocument();
  });
});
