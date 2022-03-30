import { render } from '@testing-library/react';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import IUCNClassification from './IUCNClassification';

const mockRefresh = jest.fn();

describe('IUCNClassification', () => {
  it('renders correctly with no IUCN classifications', () => {
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

    expect(getByTestId('no_classification')).toBeVisible();
  });

  it('renders correctly with 1 IUCN classification', () => {
    const { getByTestId, getByText } = render(
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

    expect(getByTestId('iucn_data')).toBeVisible();

    expect(getByText('IUCN class', { exact: false })).toBeVisible();
    expect(getByText('IUCN subclass 1', { exact: false })).toBeVisible();
    expect(getByText('IUCN subclass 2', { exact: false })).toBeVisible();
  });
});
