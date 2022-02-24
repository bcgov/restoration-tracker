import { render } from '@testing-library/react';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import PublicIUCNClassification from './PublicIUCNClassification';

const mockRefresh = jest.fn();

describe('PublicIUCNClassification', () => {
  it('renders correctly with no data', () => {
    const projectPermitData = {
      iucn: {}
    } as IGetProjectForViewResponse;

    const { getByText } = render(<PublicIUCNClassification projectForViewData={projectPermitData} refresh={mockRefresh} />);

    expect(getByText('No Classifications')).toBeVisible();
  });

  it('renders correctly', () => {
    const projectPermitData = {
      iucn: {
        classificationDetails: [
          {
            classification: 1,
            subClassification1: 2,
            subClassification2: 3
          }
        ]
      }
    } as IGetProjectForViewResponse;

    const { getByText } = render(
      <PublicIUCNClassification projectForViewData={projectPermitData} refresh={mockRefresh} />
    );

    expect(getByText('1', {exact: false})).toBeVisible();
    expect(getByText('2', {exact: false})).toBeVisible();
    expect(getByText('3', {exact: false})).toBeVisible();
  });
});
