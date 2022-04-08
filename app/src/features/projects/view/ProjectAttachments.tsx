import { mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import AttachmentsList from 'components/attachments/AttachmentsList';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetProjectAttachment, IUploadAttachmentResponse } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import { useParams } from 'react-router';

export interface IProjectAttachmentsProps {
  attachmentsList: IGetProjectAttachment[];
  getAttachments: (forceFetch: boolean) => void;
}

/**
 * Project attachments content for a project.
 *
 * @return {*}
 */
const ProjectAttachments: React.FC<IProjectAttachmentsProps> = (props) => {
  const { attachmentsList, getAttachments } = props;
  const urlParams = useParams();
  const projectId = urlParams['id'];
  const restorationTrackerApi = useRestorationTrackerApi();

  const [openUploadAttachments, setOpenUploadAttachments] = useState(false);

  const handleUploadAttachmentClick = () => setOpenUploadAttachments(true);

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

  return (
    <>
      <ComponentDialog
        open={openUploadAttachments}
        dialogTitle="Upload Documents"
        onClose={() => {
          setOpenUploadAttachments(false);
          getAttachments(true);
        }}>
        <FileUpload uploadHandler={getUploadHandler()} />
      </ComponentDialog>

      <H2ButtonToolbar
        aria-label="upload documents"
        label="Documents"
        buttonLabel="Upload"
        buttonTitle="Upload Documents"
        buttonStartIcon={<Icon path={mdiTrayArrowUp} size={1} />}
        buttonOnClick={handleUploadAttachmentClick}
        buttonProps={{
          variant: 'outlined'
        }}
      />

      <AttachmentsList projectId={projectId} attachmentsList={attachmentsList} getAttachments={getAttachments} />
    </>
  );
};

export default ProjectAttachments;
