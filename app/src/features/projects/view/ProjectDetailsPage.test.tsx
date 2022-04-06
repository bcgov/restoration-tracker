import { render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectDetailsPage from './ProjectDetailsPage';

const history = createMemoryHistory();

describe('ProjectDetailsPage', () => {
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

  it('renders correctly', async () => {
    const { getByTestId } = render(
      <Router history={history}>
        <ProjectDetailsPage projectForViewData={getProjectForViewResponse} codes={codes} refresh={jest.fn()} />
      </Router>
    );

    await waitFor(() => {
      expect(getByTestId('GeneralInfoTitle')).toBeVisible();
      expect(getByTestId('ContactsTitle')).toBeVisible();
      expect(getByTestId('PermitsTitle')).toBeVisible();
      expect(getByTestId('IUCNTitle')).toBeVisible();
      expect(getByTestId('FundingSourceTitle')).toBeVisible();
      expect(getByTestId('PartnershipTitle')).toBeVisible();
    });
  });
});
