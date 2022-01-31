import { fireEvent, render, waitFor } from '@testing-library/react';
import { Feature } from 'geojson';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import LocationBoundary from './LocationBoundary';

jest.mock('../../../../hooks/useRestorationTrackerApi');

const mockRefresh = jest.fn();

describe('LocationBoundary', () => {
  const sharedGeometry: Feature[] = [
    {
      type: 'Feature',
      id: 'myGeo',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-128, 55],
            [-128, 55.5],
            [-128, 56],
            [-126, 58],
            [-128, 55]
          ]
        ]
      },
      properties: {
        name: 'Restoration Islands'
      }
    }
  ];

  test('matches the snapshot when there is no geometry', async () => {
    const { getByTestId } = render(
      <LocationBoundary
        projectForViewData={{
          ...getProjectForViewResponse,
          location: { ...getProjectForViewResponse.location, geometry: [] }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    await waitFor(() => {
      expect(getByTestId('mapContainer')).toBeVisible();
    });
  });

  test('it renders large map properly', async () => {
    const { getByTestId, getByText } = render(
      <LocationBoundary
        projectForViewData={{
          ...getProjectForViewResponse,
          location: { ...getProjectForViewResponse.location, geometry: sharedGeometry }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    await waitFor(() => {
      expect(getByTestId('mapContainer')).toBeVisible();
      expect(getByText('Show More')).toBeVisible();
    });

    fireEvent.click(getByText('Show More'));

    await waitFor(() => {
      expect(getByText('Project Location')).toBeVisible();
    });
  });
});
