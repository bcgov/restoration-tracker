import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { useEffect, useState } from 'react';
import { useAsync } from './useAsync';

export interface IUseCodes {
  codes: IGetAllCodeSetsResponse | undefined;
  isLoading: boolean;
  isReady: boolean;
}

/**
 * Hook that fetches app code sets.
 *
 * @export
 * @return {*}  {IUseCodes}
 */
export default function useCodes(): IUseCodes {
  const api = useRestorationTrackerApi();

  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  const getCodes = useAsync(api.codes.getAllCodeSets);

  useEffect(() => {
    const fetchCodes = async () => {
      setIsLoading(true);

      const response = await getCodes();

      setCodes(response);

      setIsReady(true);
    };

    if (codes) {
      return;
    }

    fetchCodes();
  }, [codes, getCodes]);

  return { codes, isLoading, isReady };
}
