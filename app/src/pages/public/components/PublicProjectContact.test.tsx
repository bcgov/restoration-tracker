import { render } from '@testing-library/react';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import PublicProjectContact from './PublicProjectContact';

const mockRefresh = jest.fn();

describe('PublicProjectContact', () => {
  it('renders correctly', () => {
    const projectPermitData = {
      contact: {
        contacts: [
          {
            first_name: 'Amanda',
            last_name: 'Christensen',
            email_address: 'amanda@christensen.com',
            agency: 'some associates',
            is_public: 'true',
            is_primary: 'true'
          }
        ]
      }
    } as IGetProjectForViewResponse;

    const { getByText, queryAllByText } = render(
      <PublicProjectContact projectForViewData={projectPermitData} refresh={mockRefresh} />
    );

    expect(queryAllByText('Amanda', { exact: false }).length).toEqual(2);
    expect(queryAllByText('Christensen', { exact: false }).length).toEqual(2);
    expect(getByText('amanda@christensen.com', { exact: false })).toBeVisible();
    expect(getByText('some associates', { exact: false })).toBeVisible();
  });
});
