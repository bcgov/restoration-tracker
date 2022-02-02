import { render } from '@testing-library/react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import ProjectCoordinator from './ProjectCoordinator';

jest.mock('../../../../hooks/useRestorationTrackerApi');

const mockRefresh = jest.fn();

describe('ProjectCoordinator', () => {
  it('renders cordinator data correctly', async () => {
    const { getByTestId } = render(
      <ProjectCoordinator
        projectForViewData={{
          ...getProjectForViewResponse,
          coordinator: {
            first_name: 'Amanda',
            last_name: 'Christensen',
            email_address: 'amanda@christensen.com',
            coordinator_agency: 'Amanda and associates',
            share_contact_details: 'true'
          }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(getByTestId('coordinator_name')).toBeInTheDocument();
  });
});
