import { render } from '@testing-library/react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import ProjectCoordinator from './ProjectCoordinator';
import { DialogContextProvider } from 'contexts/dialogContext';

jest.mock('../../../../hooks/useRestorationTrackerApi');

const mockRefresh = jest.fn();

const renderContainer = () => {
  return render(
    <DialogContextProvider>
      <ProjectCoordinator projectForViewData={getProjectForViewResponse} codes={codes} refresh={mockRefresh} />
    </DialogContextProvider>
  );
};

describe('ProjectCoordinator', () => {
  it('renders component correctly', async () => {
    const { getByTestId } = renderContainer();

    expect(getByTestId('CoordinatorTitle')).toBeVisible();
  });

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

    expect(getByTestId('CoordinatorName')).toBeInTheDocument();
  });
});
