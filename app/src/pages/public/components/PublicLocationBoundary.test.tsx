import { render, waitFor } from '@testing-library/react';
import { Feature } from 'geojson';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetProjectTreatment } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicLocationBoundary from './PublicLocationBoundary';

jest.mock('../../../hooks/useRestorationTrackerApi');

const mockRefresh = jest.fn();

const mockuseRestorationTrackerApi = {
  external: {
    post: jest.fn()
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

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

  const treatment = [
    {
      id: 'TU12',
      type: 'Other',
      width: 100,
      length: 100,
      area: 10000,
      comments: 'something12',
      description: 'anything12',
      treatments: [
        {
          treatment_name: 'Tree Felling',
          treatment_year: '2015'
        }
      ]
    }
  ] as IGetProjectTreatment[];

  test('matches the snapshot when there is no geometry', async () => {
    mockRestorationTrackerApi().external.post.mockResolvedValue([]);
    const { getByTestId } = render(
      <PublicLocationBoundary
        projectForViewData={{
          ...getProjectForViewResponse,
          location: { ...getProjectForViewResponse.location, geometry: sharedGeometry }
        }}
        treatmentList={treatment}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    await waitFor(() => {
      expect(getByTestId('map_container')).toBeVisible();
    });
  });
});
