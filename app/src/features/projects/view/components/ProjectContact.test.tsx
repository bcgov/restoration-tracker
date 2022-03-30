import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectContact from './ProjectContact';

jest.mock('../../../../hooks/useRestorationTrackerApi');

const mockRefresh = jest.fn();

describe('ProjectContact', () => {
  it('renders contact data correctly', async () => {
    const { getByTestId } = render(
      <ProjectContact
        projectForViewData={{
          ...getProjectForViewResponse,
          contact: {
            contacts: [
              {
                first_name: 'Amanda',
                last_name: 'Christensen',
                email_address: 'amanda@christensen.com',
                agency: 'Amanda and associates',
                is_public: 'true',
                is_primary: 'true'
              }
            ]
          }
        }}
        refresh={mockRefresh}
      />
    );

    expect(getByTestId('contact_name')).toBeInTheDocument();
  });
});
