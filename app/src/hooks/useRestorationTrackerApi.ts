import axios from 'axios';
import { ConfigContext } from 'contexts/configContext';
import { useContext } from 'react';
import useAdminApi from './api/useAdminApi';
import useAxios from './api/useAxios';
import useCodesApi from './api/useCodesApi';
import useDraftApi from './api/useDraftApi';
import useExternalApi from './api/useExternalApi';
import useProjectApi, { usePublicProjectApi } from './api/useProjectApi';
import useSearchApi, { usePublicSearchApi, useSearchTaxonomyApi } from './api/useSearchApi';
import useUserApi from './api/useUserApi';

/**
 * Returns a set of supported api methods.
 *
 * @return {*} object whose properties are supported api methods.
 */
export const useRestorationTrackerApi = () => {
  const config = useContext(ConfigContext);
  const apiAxios = useAxios(config?.API_HOST);

  const project = useProjectApi(apiAxios);

  const search = useSearchApi(apiAxios);

  const searchTaxonomy = useSearchTaxonomyApi(apiAxios);

  const codes = useCodesApi(apiAxios);

  const draft = useDraftApi(apiAxios);

  const user = useUserApi(apiAxios);

  const admin = useAdminApi(apiAxios);

  const external = useExternalApi(axios);

  const publicApis = {
    project: usePublicProjectApi(apiAxios),
    search: usePublicSearchApi(apiAxios)
  };

  return {
    project,
    search,
    searchTaxonomy,
    codes,
    draft,
    user,
    admin,
    external,
    public: publicApis
  };
};
