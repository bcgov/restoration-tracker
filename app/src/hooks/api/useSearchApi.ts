import { AxiosInstance } from 'axios';
import { IGetSearchResultsResponse } from 'interfaces/useSearchApi.interface';

/**
 * Returns a set of supported api methods for working with search functionality
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useSearchApi = (axios: AxiosInstance) => {
  /**
   * Get search results (spatial)
   *
   * @return {*}  {Promise<IGetSearchResultsResponse[]>}
   */
  const getSearchResults = async (): Promise<IGetSearchResultsResponse[]> => {
    const { data } = await axios.get(`/api/search`);

    return data;
  };

  return {
    getSearchResults
  };
};

export default useSearchApi;

/**
 * Returns a set of supported api methods for working with public search functionality.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
export const usePublicSearchApi = (axios: AxiosInstance) => {
  /**
   * Get public search results (spatial)
   *
   * @return {*}  {Promise<IGetSearchResultsResponse[]>}
   */
  const getSearchResults = async (): Promise<IGetSearchResultsResponse[]> => {
    const { data } = await axios.get(`/api/public/search`);

    return data;
  };

  return {
    getSearchResults
  };
};

/**
 * Returns a set of supported api methods for working with taxonomy search functionality.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
export const useSearchTaxonomyApi = (axios: AxiosInstance) => {
  /**
   * Get search results (taxonomy)
   *
   * @return {*}  {Promise<[any]>}
   */
  const getSearchResults = async (value: any): Promise<any> => {    
    axios.defaults.params = { terms: value };    

    const { data } = await axios(`/api/taxonomy/search`);

    return data;
  };

  return {
    getSearchResults
  };
};
