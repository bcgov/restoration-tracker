import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicProjectDetails from './PublicProjectDetails';

describe('PublicProjectDetails', () => {
  getProjectForViewResponse.location.geometry.push({
    id: 'myGeo',
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [125.6, 10.1]
    },
    properties: {
      name: 'Dinagat Islands'
    }
  });

  jest.spyOn(console, 'debug').mockImplementation(() => {});

  const component = (
    <PublicProjectDetails projectForViewData={getProjectForViewResponse} codes={codes} refresh={jest.fn()} />
  );

  it('renders correctly', async () => {
    const { getByText, getByTestId, queryAllByText } = render(component);

    await waitFor(() => {
      expect(queryAllByText('Test Project Name', { exact: false }).length).toEqual(2);
      expect(getByText('Completed', { exact: false })).toBeVisible();
      expect(getByTestId('projectPermitsTitle')).toBeVisible();
      expect(getByTestId('IUCNTitle')).toBeVisible();
      expect(getByTestId('fundingSourcesTitle')).toBeVisible();
      expect(getByTestId('partnershipsTitle')).toBeVisible();
    });
  });
});
