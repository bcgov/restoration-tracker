import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import { mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import AttachmentsList from 'components/attachments/AttachmentsList';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import {
  IGetProjectAttachment,
  IGetProjectForViewResponse,
  IUploadAttachmentResponse
} from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

export interface IProjectAttachmentsProps {
  projectForViewData: IGetProjectForViewResponse;
}

/**
 * Project attachments content for a project.
 *
 * @return {*}
 */
const ProjectAttachments: React.FC<IProjectAttachmentsProps> = () => {
  const urlParams = useParams();
  const projectId = urlParams['id'];
  const restorationTrackerApi = useRestorationTrackerApi();

  const [openUploadAttachments, setOpenUploadAttachments] = useState(false);
  const [attachmentsList, setAttachmentsList] = useState<IGetProjectAttachment[]>([]);

  const handleUploadAttachmentClick = () => {
    setOpenUploadAttachments(true);
  };

  const getAttachments = useCallback(
    async (forceFetch: boolean) => {
      if (attachmentsList.length && !forceFetch) {
        return;
      }

      try {
        const response = await restorationTrackerApi.project.getProjectAttachments(projectId);

        if (!response?.attachmentsList) {
          return;
        }

        setAttachmentsList([...response.attachmentsList]);
      } catch (error) {
        return error;
      }
    },
    [restorationTrackerApi.project, projectId, attachmentsList.length]
  );

  const getUploadHandler = (): IUploadHandler<IUploadAttachmentResponse> => {
    return (file, cancelToken, handleFileUploadProgress) => {
      return restorationTrackerApi.project.uploadProjectAttachments(
        projectId,
        file,
        cancelToken,
        handleFileUploadProgress
      );
    };
  };

  useEffect(() => {
    getAttachments(false);
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <ComponentDialog
        open={openUploadAttachments}
        dialogTitle="Upload Attachment"
        onClose={() => {
          setOpenUploadAttachments(false);
          getAttachments(true);
        }}>
        <FileUpload uploadHandler={getUploadHandler()} />
      </ComponentDialog>
      <Paper>
        <H2ButtonToolbar
          label="Documents"
          buttonLabel="Upload"
          buttonTitle="Upload Document"
          buttonStartIcon={<Icon path={mdiTrayArrowUp} size={1} />}
          buttonOnClick={handleUploadAttachmentClick}
        />
        <Box px={3} pb={2}>
          <AttachmentsList projectId={projectId} attachmentsList={attachmentsList} getAttachments={getAttachments} />
        </Box>
      </Paper>
    </>
  );
};

export default ProjectAttachments;
