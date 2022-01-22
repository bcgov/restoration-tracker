import { AxiosInstance } from 'axios';
import {
  ICreatePermitsRequest,
  ICreatePermitsResponse,
  IGetPermitsListResponse
} from 'interfaces/usePermitApi.interface';

/**
 * Returns a set of supported api methods for working with permits as their own entities.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const usePermitApi = (axios: AxiosInstance) => {
  /**
   * Get a list of all permits
   *
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<IGetPermitsListResponse[]>}
   */
  const getPermitsList = async (): Promise<IGetPermitsListResponse[]> => {
    const { data } = await axios.get(`/api/permit/list`);

    return data;
  };

  /**
   * Create permits (non-sampling).
   *
   * @param {ICreatePermitsRequest} permitsData
   * @return {*}  {Promise<ICreatePermitsResponse[]>}
   */
  const createPermits = async (permitsData: ICreatePermitsRequest): Promise<ICreatePermitsResponse[]> => {
    const { data } = await axios.post('/api/permit/create-no-sampling', permitsData);

    return data;
  };

  return {
    getPermitsList,
    createPermits
  };
};

export default usePermitApi;
