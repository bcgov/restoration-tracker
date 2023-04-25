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
      reconnaissance_conducted: 'no',
      geometry: {} as Feature,
      treatments: [
        {
          treatment_name: 'Seeding',
          treatment_year: '2020',
          implemented: 'yes'
        },
        {
          treatment_name: 'Tree Bending',
          treatment_year: '2021',
          implemented: 'partial'
        }
      ]
    },
    {
      id: 'TU2',
      type: 'Other',
      width: 100,
      length: 100,
      area: 10000,
      reconnaissance_conducted: 'not applicable',
      comments: 'something2',
      geometry: {} as Feature,
      treatments: [
        {
          treatment_name: 'Tree Felling',
          treatment_year: '2015',
          implemented: 'yes'
        }
      ]
    }
  ];

  it('renders correctly with no treatments', () => {
    const { getByText } = render(<TreatmentList treatmentList={[]} />);

    expect(getByText('No Treatments')).toBeInTheDocument();
  });

  it('renders correctly with one treatment', async () => {
    const { getByText } = render(<TreatmentList treatmentList={[treatmentList[0]]} />);

    expect(getByText('Road')).toBeInTheDocument();
  });

  it('renders correctly with multiple treatments', async () => {
    const { getByText } = render(<TreatmentList treatmentList={treatmentList} />);

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
        reconnaissance_conducted: 'no',
        comments: 'something3',
        geometry: {} as Feature,
        treatments: [
          {
            treatment_name: 'Seeding',
            treatment_year: '2020',
            implemented: 'yes'
          },
          {
            treatment_name: 'Tree Bending',
            treatment_year: '2021',
            implemented: 'no'
          }
        ]
      },
      {
        id: 'TU4',
        type: 'Other',
        width: 100,
        length: 100,
        area: 10000,
        reconnaissance_conducted: 'not applicable',
        comments: 'something4',
        geometry: {} as Feature,
        treatments: [
          {
            treatment_name: 'Tree Felling',
            treatment_year: '2015',
            implemented: 'partial'
          }
        ]
      },
      {
        id: 'TU5',
        type: 'Road',
        width: 100,
        length: 100,
        area: 10000,
        reconnaissance_conducted: null,
        comments: 'something5',
        geometry: {} as Feature,
        treatments: [
          {
            treatment_name: 'Seeding',
            treatment_year: '2020',
            implemented: null
          },
          {
            treatment_name: 'Tree Bending',
            treatment_year: '2021',
            implemented: null
          }
        ]
      },
      {
        id: 'TU6',
        type: 'Other',
        width: 100,
        length: 100,
        area: 10000,
        reconnaissance_conducted: 'no',
        comments: 'something6',
        geometry: {} as Feature,
        treatments: [
          {
            treatment_name: 'Tree Felling',
            treatment_year: '2015',
            implemented: 'yes'
          }
        ]
      },
      {
        id: 'TU7',
        type: 'Road',
        width: 100,
        length: 100,
        area: 10000,
        reconnaissance_conducted: 'yes',
        comments: 'something7',
        geometry: {} as Feature,
        treatments: [
          {
            treatment_name: 'Seeding',
            treatment_year: '2020',
            implemented: 'no'
          },
          {
            treatment_name: 'Tree Bending',
            treatment_year: '2021',
            implemented: 'no'
          }
        ]
      },
      {
        id: 'TU8',
        type: 'Other',
        width: 100,
        length: 100,
        area: 10000,
        reconnaissance_conducted: null,
        comments: 'something8',
        geometry: {} as Feature,
        treatments: [
          {
            treatment_name: 'Tree Felling',
            treatment_year: '2015',
            implemented: 'yes'
          }
        ]
      },
      {
        id: 'TU9',
        type: 'Road',
        width: 100,
        length: 100,
        area: 10000,
        reconnaissance_conducted: 'yes',
        comments: 'something9',
        geometry: {} as Feature,
        treatments: [
          {
            treatment_name: 'Seeding',
            treatment_year: '2020',
            implemented: 'partial'
          },
          {
            treatment_name: 'Tree Bending',
            treatment_year: '2021',
            implemented: null
          }
        ]
      },
      {
        id: 'TU10',
        type: 'Other',
        width: 100,
        length: 100,
        area: 10000,
        reconnaissance_conducted: 'not applicable',
        comments: 'something10',
        geometry: {} as Feature,
        treatments: [
          {
            treatment_name: 'Tree Felling',
            treatment_year: '2015',
            implemented: 'yes'
          }
        ]
      }
    ];

    const { getByText, getByLabelText } = render(<TreatmentList treatmentList={largeTreatmentList} />);

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
    const { queryByText } = render(<TreatmentList treatmentList={treatmentList} />);

    expect(queryByText('something2')).toBeNull();
  });

  it('renders correctly with open treatment unit details dialog', async () => {
    const { getByText, getAllByTestId } = render(<TreatmentList treatmentList={treatmentList} />);

    expect(getByText('Other')).toBeInTheDocument();
    expect(getByText('Road')).toBeInTheDocument();

    fireEvent.click(getAllByTestId('view-treatment-unit-details')[0]);

    await waitFor(() => {
      expect(getByText('something1', { exact: false })).toBeInTheDocument();
    });
  });
});
