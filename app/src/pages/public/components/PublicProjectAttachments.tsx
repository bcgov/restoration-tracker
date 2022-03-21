import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetProjectAttachment, IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import PublicAttachmentsList from './PublicAttachmentsList';

export interface IPublicProjectAttachmentsProps {
  projectForViewData: IGetProjectForViewResponse;
}

/**
 * Project attachments content for a public (published) project.
 *
 * @return {*}
 */
const PublicProjectAttachments: React.FC<IPublicProjectAttachmentsProps> = () => {
  const urlParams = useParams();
  const projectId = urlParams['id'];
  const restorationTrackerApi = useRestorationTrackerApi();

  const [attachmentsList, setAttachmentsList] = useState<IGetProjectAttachment[]>([]);

  const getAttachments = useCallback(
    async (forceFetch: boolean) => {
      if (attachmentsList.length && !forceFetch) {
        return;
      }

      try {
        const response = await restorationTrackerApi.public.project.getProjectAttachments(projectId);

        if (!response?.attachmentsList) {
          return;
        }

        setAttachmentsList([...response.attachmentsList]);
      } catch (error) {
        return error;
      }
    },
    [attachmentsList.length, restorationTrackerApi.public.project, projectId]
  );

  useEffect(() => {
    getAttachments(false);
    // eslint-disable-next-line
  }, []);

  return (
    <Box py={1}>
      <Box mt={2} mb={3} px={2} display="flex" justifyContent="space-between">
        <Typography variant="h3">Documents</Typography>
      </Box>

      <Box mb={3}>
        <PublicAttachmentsList
          projectId={projectId}
          attachmentsList={attachmentsList}
          getAttachments={getAttachments}
        />
      </Box>
    </Box>
  );
};

export default PublicProjectAttachments;
