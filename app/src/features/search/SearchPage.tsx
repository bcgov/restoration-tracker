import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import centroid from '@turf/centroid';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import MapContainer from 'components/map/MapContainer';
import { SearchFeaturePopup } from 'components/map/SearchFeaturePopup';
import { IMarker } from 'components/map/components/MarkerCluster';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { LatLngTuple } from 'leaflet';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { isAuthenticated } from 'utils/authUtils';
import { generateValidGeometryCollection } from 'utils/mapBoundaryUploadHelpers';

/**
 * Page to search for and display a list of records spatially.
 *
 * @return {*}
 */
const SearchPage: React.FC = () => {
  const restorationApi = useRestorationTrackerApi();

  const [performSearch, setPerformSearch] = useState<boolean>(true);
  const [geometries, setGeometries] = useState<IMarker[]>([]);

  const dialogContext = useContext(DialogContext);
  const { keycloakWrapper } = useContext(AuthStateContext);

  const showFilterErrorDialog = useCallback(
    (textDialogProps?: Partial<IErrorDialogProps>) => {
      dialogContext.setErrorDialog({
        onClose: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        onOk: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        ...textDialogProps,
        open: true
      });
    },
    [dialogContext]
  );

  const getSearchResults = useCallback(async () => {
    try {
      const response = isAuthenticated(keycloakWrapper)
        ? await restorationApi.search.getSearchResults()
        : await restorationApi.public.search.getSearchResults();

      if (!response) {
        setPerformSearch(false);
        return;
      }

      const clusteredPointGeometries: IMarker[] = [];

      response.forEach((result: any) => {
        const feature = generateValidGeometryCollection(result.geometry, result.id).geometryCollection[0];

        clusteredPointGeometries.push({
          position: centroid(feature as any).geometry.coordinates as LatLngTuple,
          popup: <SearchFeaturePopup featureData={result} />
        });
      });

      setPerformSearch(false);
      setGeometries(clusteredPointGeometries);
    } catch (error) {
      const apiError = error as APIError;
      showFilterErrorDialog({
        dialogTitle: 'Error Searching For Results',
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
    }
  }, [restorationApi.search, restorationApi.public.search, showFilterErrorDialog, keycloakWrapper]);

  useEffect(() => {
    if (performSearch) {
      getSearchResults();
    }
  }, [performSearch, getSearchResults]);

  /**
   * Displays search results visualized on a map spatially.
   */
  return (
    <Container maxWidth="xl">
      <Box mb={5} display="flex" justifyContent="space-between">
        <Typography variant="h1">Map</Typography>
      </Box>
      <Box height={750}>
        <MapContainer
          mapId="search_boundary_map"
          fullScreenControl={true}
          scrollWheelZoom={true}
          markers={geometries}
        />
      </Box>
    </Container>
  );
};

export default SearchPage;
