import { render } from '@testing-library/react';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import React from 'react';
import IUCNClassification from './IUCNClassification';
import { codes } from 'test-helpers/code-helpers';

jest.mock('../../../../hooks/useRestorationTrackerApi');

const mockRefresh = jest.fn();

describe('IUCNClassification', () => {
  it('renders component correctly', () => {
    const { getByTestId } = render(
      <IUCNClassification
        projectForViewData={{
          ...getProjectForViewResponse
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(getByTestId('IUCNTitle')).toBeVisible();
  });

  it('renders correctly with no classification details', () => {
    const { getByTestId } = render(
      <IUCNClassification
        projectForViewData={{
          ...getProjectForViewResponse,
          iucn: {
            classificationDetails: []
          }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(getByTestId('NoClassification')).toBeVisible();
  });

  it('renders correctly with classification details', () => {
    const { getByTestId } = render(
      <IUCNClassification
        projectForViewData={{
          ...getProjectForViewResponse,
          iucn: {
            classificationDetails: [
              {
                classification: 1,
                subClassification1: 1,
                subClassification2: 1
              }
            ]
          }
        }}
        codes={codes}
        refresh={mockRefresh}
      />
    );

    expect(getByTestId('IUCNData')).toBeVisible();
  });
});
