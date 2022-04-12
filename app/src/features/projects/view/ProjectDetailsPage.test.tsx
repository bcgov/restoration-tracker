import { render, waitFor } from '@testing-library/react';
import { AuthStateContext } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { getMockAuthState } from 'test-helpers/auth-helpers';
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

  it('renders correctly when user has no system or project role', async () => {
    const authState = getMockAuthState({
      keycloakWrapper: { hasSystemRole: () => false, hasProjectRole: () => false }
    });

    const { getByTestId, queryByTestId } = render(
      <Router history={history}>
        <AuthStateContext.Provider value={authState}>
          <ProjectDetailsPage projectForViewData={getProjectForViewResponse} codes={codes} refresh={jest.fn()} />
        </AuthStateContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(getByTestId('GeneralInfoTitle')).toBeVisible();
      expect(getByTestId('ContactsTitle')).toBeVisible();
      expect(queryByTestId('PermitsTitle')).not.toBeInTheDocument();
      expect(getByTestId('IUCNTitle')).toBeVisible();
      expect(getByTestId('FundingSourceTitle')).toBeVisible();
      expect(getByTestId('PartnershipTitle')).toBeVisible();
    });
  });

  it('renders correctly when user has a relevant system role', async () => {
    const authState = getMockAuthState({
      keycloakWrapper: { hasSystemRole: () => true, hasProjectRole: () => false }
    });

    const { getByTestId } = render(
      <Router history={history}>
        <AuthStateContext.Provider value={authState}>
          <ProjectDetailsPage projectForViewData={getProjectForViewResponse} codes={codes} refresh={jest.fn()} />
        </AuthStateContext.Provider>
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

  it('renders correctly when user has a relevant project role', async () => {
    const authState = getMockAuthState({
      keycloakWrapper: { hasSystemRole: () => true, hasProjectRole: () => false }
    });

    const { getByTestId } = render(
      <Router history={history}>
        <AuthStateContext.Provider value={authState}>
          <ProjectDetailsPage projectForViewData={getProjectForViewResponse} codes={codes} refresh={jest.fn()} />
        </AuthStateContext.Provider>
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
