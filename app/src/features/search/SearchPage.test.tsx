import { render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetSearchResultsResponse } from 'interfaces/useSearchApi.interface';
import React from 'react';
import { Router } from 'react-router-dom';
import SearchPage from './SearchPage';

jest.mock('../../hooks/useRestorationTrackerApi');

const mockUseRestorationTrackerApi = {
  search: {
    getSearchResults: jest.fn<Promise<IGetSearchResultsResponse[]>, []>()
  },
  public: {
    search: {
      getSearchResults: jest.fn<Promise<IGetSearchResultsResponse[]>, []>()
    }
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockUseRestorationTrackerApi
>).mockReturnValue(mockUseRestorationTrackerApi);

const history = createMemoryHistory();

describe('SearchPage', () => {
  it('renders correctly', async () => {
    mockRestorationTrackerApi().search.getSearchResults.mockResolvedValue([]);
    mockRestorationTrackerApi().public.search.getSearchResults.mockResolvedValue([]);

    const { getByText } = render(
      <Router history={history}>
        <SearchPage />
      </Router>
    );

    await waitFor(() => {
      expect(getByText('Map')).toBeInTheDocument();
    });
  });
});
