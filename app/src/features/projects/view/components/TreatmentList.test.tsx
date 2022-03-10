import { cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';
import TreatmentList from './TreatmentList';

describe('TreatmentList', () => {
  afterEach(() => {
    cleanup();
  });

  const treatmentList = [
    {
      id: 'TU1',
      type: 'Road',
      width: 100,
      length: 100,
      area: 10000,
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
      treatments: [
        {
          treatment_name: 'Tree Felling',
          treatment_year: '2015'
        }
      ]
    }
  ];

  it('renders correctly with no treatments', () => {
    const { getByText } = render(<TreatmentList treatmentList={[]} getTreatments={jest.fn()} />);

    expect(getByText('No Treatments')).toBeInTheDocument();
  });

  it('renders correctly with one treatment', async () => {
    const treatmentList = [
      {
        id: 'TU1',
        type: 'Road',
        width: 100,
        length: 100,
        area: 10000,
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
      }
    ];
    const { getByText } = render(<TreatmentList treatmentList={treatmentList} getTreatments={jest.fn()} />);

    expect(getByText('Road')).toBeInTheDocument();
  });

  it('renders correctly with multiple treatments', async () => {
    const treatmentList = [
      {
        id: 'TU1',
        type: 'Road',
        width: 100,
        length: 100,
        area: 10000,
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
        treatments: [
          {
            treatment_name: 'Tree Felling',
            treatment_year: '2015'
          }
        ]
      }
    ];
    const { getByText } = render(<TreatmentList treatmentList={treatmentList} getTreatments={jest.fn()} />);

    expect(getByText('Other')).toBeInTheDocument();
    expect(getByText('Road')).toBeInTheDocument();
  });

  it('changing pages displays the correct rows as expected', () => {
    const largeTreatmentList = [
      {
        id: 'TU1',
        type: 'Road',
        width: 100,
        length: 100,
        area: 10000,
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
        treatments: [
          {
            treatment_name: 'Tree Felling',
            treatment_year: '2015'
          }
        ]
      },
      {
        id: 'TU3',
        type: 'Road',
        width: 100,
        length: 100,
        area: 10000,
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
        treatments: [
          {
            treatment_name: 'Tree Felling',
            treatment_year: '2015'
          }
        ]
      },
      {
        id: 'TU11',
        type: 'Road',
        width: 100,
        length: 100,
        area: 10000,
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
        id: 'TU12',
        type: 'Other',
        width: 100,
        length: 100,
        area: 10000,
        treatments: [
          {
            treatment_name: 'Tree Felling',
            treatment_year: '2015'
          }
        ]
      }
    ];

    const { getByText, queryByText, getByLabelText } = render(
      <TreatmentList treatmentList={largeTreatmentList} getTreatments={jest.fn()} />
    );

    expect(getByText('TU1')).toBeInTheDocument();
    expect(getByText('TU2')).toBeInTheDocument();
    expect(getByText('TU3')).toBeInTheDocument();
    expect(getByText('TU4')).toBeInTheDocument();
    expect(getByText('TU5')).toBeInTheDocument();
    expect(getByText('TU6')).toBeInTheDocument();
    expect(getByText('TU7')).toBeInTheDocument();
    expect(getByText('TU8')).toBeInTheDocument();
    expect(getByText('TU9')).toBeInTheDocument();
    expect(getByText('TU10')).toBeInTheDocument();
    expect(queryByText('TU11')).toBeNull();

    fireEvent.click(getByLabelText('Next page'));

    expect(getByText('TU11')).toBeInTheDocument();
    expect(getByText('TU12')).toBeInTheDocument();
    expect(queryByText('TU1')).toBeNull();
  });
});
