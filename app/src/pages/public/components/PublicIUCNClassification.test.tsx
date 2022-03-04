import { render } from '@testing-library/react';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import PublicIUCNClassification from './PublicIUCNClassification';

const mockRefresh = jest.fn();

describe('PublicIUCNClassification', () => {
  it('renders correctly with no data', () => {
    const projectPermitData = {
      iucn: {}
    } as IGetProjectForViewResponse;

    const { getByText } = render(
      <PublicIUCNClassification projectForViewData={projectPermitData} codes={codes} refresh={mockRefresh} />
    );

    expect(getByText('No Classifications')).toBeVisible();
  });

  it('renders correctly', () => {
    const projectPermitData = {
      iucn: {
        classificationDetails: [
          {
            classification: 1,
            subClassification1: 1,
            subClassification2: 1
          }
        ]
      }
    } as IGetProjectForViewResponse;

    const { getByText } = render(
      <PublicIUCNClassification projectForViewData={projectPermitData} codes={codes} refresh={mockRefresh} />
    );

    expect(getByText('IUCN class', { exact: false })).toBeVisible();
    expect(getByText('IUCN subclass 1', { exact: false })).toBeVisible();
    expect(getByText('IUCN subclass 2', { exact: false })).toBeVisible();
  });
});
