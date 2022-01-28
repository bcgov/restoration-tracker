import { render } from '@testing-library/react';
import React from 'react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import Partnerships from './Partnerships';
import { codes } from 'test-helpers/code-helpers';

jest.mock('../../../../hooks/useRestorationTrackerApi');

const mockRefresh = jest.fn();

describe('Partnerships', () => {

  it('renders correctly with default empty values', () => {
    const { getByTestId } = render(
      <Partnerships
        projectForViewData={{
          ...getProjectForViewResponse,
          partnerships: {
            indigenous_partnerships: [],
            stakeholder_partnerships: []
          }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(getByTestId('NoIndigenousPartners')).toBeVisible();
    expect(getByTestId('NoOtherPartners')).toBeVisible();
  });

  it('renders correctly with invalid null values', () => {
    const { getByTestId } = render(
      <Partnerships
        projectForViewData={{
          ...getProjectForViewResponse,
          partnerships: {
            indigenous_partnerships: (null as unknown) as number[],
            stakeholder_partnerships: (null as unknown) as string[]
          }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(getByTestId('NoIndigenousPartners')).toBeVisible();
    expect(getByTestId('NoOtherPartners')).toBeVisible();
  });

  it('renders correctly with existing partnership values', () => {
    const { getByTestId } = render(
      <Partnerships projectForViewData={{...getProjectForViewResponse,
        partnerships: {
          indigenous_partnerships: [0, 1],
          stakeholder_partnerships: ['partner2', 'partner3']
        }
      }}
      codes={codes} refresh={mockRefresh} />
    );

    expect(getByTestId('IndigenousPartners')).toBeVisible();
    expect(getByTestId('OtherPartners')).toBeVisible();
  });
});
