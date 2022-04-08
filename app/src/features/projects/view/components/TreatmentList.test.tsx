import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { Feature } from 'geojson';
import { IGetProjectTreatment } from 'interfaces/useProjectApi.interface';
import React from 'react';
import TreatmentList from './TreatmentList';

describe('TreatmentList', () => {
  afterEach(() => {
    cleanup();
  });

  const treatmentList: IGetProjectTreatment[] = [
    {
      id: 'TU1',
      type: 'Road',
      width: 100,
      length: 100,
      area: 10000,
      comments: 'something1',
      geometry: {} as Feature,
      treatments: [
        {
          treatment_name: 'Seeding',
          treatment_year: '2020'
        },
        {
          treatment_name: 'Tree Bending',
          treatment_year: '2021'
        }
      ]
    },
    {
      id: 'TU2',
      type: 'Other',
      width: 100,
      length: 100,
      area: 10000,
      comments: 'something2',
      geometry: {} as Feature,
      treatments: [
        {
          treatment_name: 'Tree Felling',
          treatment_year: '2015'
        }
      ]
    }
  ];

  it('renders correctly with no treatments', () => {
    const { getByText } = render(<TreatmentList treatmentList={[]} getTreatments={jest.fn()} refresh={jest.fn()} />);

    expect(getByText('No Treatments')).toBeInTheDocument();
  });

  it('renders correctly with one treatment', async () => {
    const { getByText } = render(
      <TreatmentList treatmentList={[treatmentList[0]]} getTreatments={jest.fn()} refresh={jest.fn()} />
    );

    expect(getByText('Road')).toBeInTheDocument();
  });

  it('renders correctly with multiple treatments', async () => {
    const { getByText } = render(
      <TreatmentList treatmentList={treatmentList} getTreatments={jest.fn()} refresh={jest.fn()} />
    );

    expect(getByText('Other')).toBeInTheDocument();
    expect(getByText('Road')).toBeInTheDocument();
  });

  it('changing pages displays the correct rows as expected', () => {
    const largeTreatmentList: IGetProjectTreatment[] = [
      ...treatmentList,
      {
        id: 'TU3',
        type: 'Road',
        width: 100,
        length: 100,
        area: 10000,
        comments: 'something3',
        geometry: {} as Feature,
        treatments: [
          {
            treatment_name: 'Seeding',
            treatment_year: '2020'
          },
          {
            treatment_name: 'Tree Bending',
            treatment_year: '2021'
          }
        ]
      },
      {
        id: 'TU4',
        type: 'Other',
        width: 100,
        length: 100,
        area: 10000,
        comments: 'something4',
        geometry: {} as Feature,
        treatments: [
          {
            treatment_name: 'Tree Felling',
            treatment_year: '2015'
          }
        ]
      },
      {
        id: 'TU5',
        type: 'Road',
        width: 100,
        length: 100,
        area: 10000,
        comments: 'something5',
        geometry: {} as Feature,
        treatments: [
          {
            treatment_name: 'Seeding',
            treatment_year: '2020'
          },
          {
            treatment_name: 'Tree Bending',
            treatment_year: '2021'
          }
        ]
      },
      {
        id: 'TU6',
        type: 'Other',
        width: 100,
        length: 100,
        area: 10000,
        comments: 'something6',
        geometry: {} as Feature,
        treatments: [
          {
            treatment_name: 'Tree Felling',
            treatment_year: '2015'
          }
        ]
      },
      {
        id: 'TU7',
        type: 'Road',
        width: 100,
        length: 100,
        area: 10000,
        comments: 'something7',
        geometry: {} as Feature,
        treatments: [
          {
            treatment_name: 'Seeding',
            treatment_year: '2020'
          },
          {
            treatment_name: 'Tree Bending',
            treatment_year: '2021'
          }
        ]
      },
      {
        id: 'TU8',
        type: 'Other',
        width: 100,
        length: 100,
        area: 10000,
        comments: 'something8',
        geometry: {} as Feature,
        treatments: [
          {
            treatment_name: 'Tree Felling',
            treatment_year: '2015'
          }
        ]
      },
      {
        id: 'TU9',
        type: 'Road',
        width: 100,
        length: 100,
        area: 10000,
        comments: 'something9',
        geometry: {} as Feature,
        treatments: [
          {
            treatment_name: 'Seeding',
            treatment_year: '2020'
          },
          {
            treatment_name: 'Tree Bending',
            treatment_year: '2021'
          }
        ]
      },
      {
        id: 'TU10',
        type: 'Other',
        width: 100,
        length: 100,
        area: 10000,
        comments: 'something10',
        geometry: {} as Feature,
        treatments: [
          {
            treatment_name: 'Tree Felling',
            treatment_year: '2015'
          }
        ]
      }
    ];

    const { getByText, getByLabelText } = render(
      <TreatmentList treatmentList={largeTreatmentList} getTreatments={jest.fn()} refresh={jest.fn()} />
    );

    expect(getByText('TU1')).toBeInTheDocument();
    expect(getByText('TU2')).toBeInTheDocument();
    expect(getByText('TU3')).toBeInTheDocument();
    expect(getByText('TU4')).toBeInTheDocument();
    expect(getByText('TU5')).toBeInTheDocument();

    fireEvent.click(getByLabelText('Next page'));

    expect(getByText('TU6')).toBeInTheDocument();
    expect(getByText('TU7')).toBeInTheDocument();
    expect(getByText('TU8')).toBeInTheDocument();
    expect(getByText('TU9')).toBeInTheDocument();
    expect(getByText('TU10')).toBeInTheDocument();
  });

  it('renders correctly with closed treatment unit details dialog', async () => {
    const { queryByText } = render(
      <TreatmentList treatmentList={treatmentList} getTreatments={jest.fn()} refresh={jest.fn()} />
    );

    expect(queryByText('something2')).toBeNull();
  });

  it('renders correctly with open treatment unit details dialog', async () => {
    const { getByText, getAllByTestId } = render(
      <TreatmentList treatmentList={treatmentList} getTreatments={jest.fn()} refresh={jest.fn()} />
    );

    expect(getByText('Other')).toBeInTheDocument();
    expect(getByText('Road')).toBeInTheDocument();

    fireEvent.click(getAllByTestId('view-treatment-unit-details')[0]);

    await waitFor(() => {
      expect(getByText('something1', { exact: false })).toBeInTheDocument();
    });
  });
});
