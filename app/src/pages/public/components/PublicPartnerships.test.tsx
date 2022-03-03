import { render } from '@testing-library/react';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import PublicPartnerships from './PublicPartnerships';

const mockRefresh = jest.fn();

describe('PublicPartnerships', () => {
  it('renders correctly with default empty values', () => {
    const projectPermitData = ({
      partnerships: {
        indigenous_partnerships: [],
        stakeholder_partnerships: []
      }
    } as unknown) as IGetProjectForViewResponse;

    const { getByTestId } = render(
      <PublicPartnerships projectForViewData={projectPermitData} codes={codes} refresh={mockRefresh} />
    );

    expect(getByTestId('no_indigenous_partners_data')).toBeVisible();
    expect(getByTestId('no_stakeholder_partners_data')).toBeVisible();
  });

  it('renders correctly with invalid null values', () => {
    const projectPermitData = {
      partnerships: {
        indigenous_partnerships: (null as unknown) as number[],
        stakeholder_partnerships: (null as unknown) as string[]
      }
    } as IGetProjectForViewResponse;

    const { getByTestId } = render(
      <PublicPartnerships projectForViewData={projectPermitData} codes={codes} refresh={mockRefresh} />
    );

    expect(getByTestId('no_indigenous_partners_data')).toBeVisible();
    expect(getByTestId('no_stakeholder_partners_data')).toBeVisible();
  });

  it('renders correctly with existing partnership values', () => {
    const projectPermitData = {
      partnerships: {
        indigenous_partnerships: [0, 1],
        stakeholder_partnerships: ['partner2', 'partner3']
      }
    } as IGetProjectForViewResponse;

    const { getAllByTestId } = render(
      <PublicPartnerships projectForViewData={projectPermitData} codes={codes} refresh={mockRefresh} />
    );

    expect(getAllByTestId('indigenous_partners_data').length).toEqual(2);
    expect(getAllByTestId('stakeholder_partners_data').length).toEqual(2);
  });
});
