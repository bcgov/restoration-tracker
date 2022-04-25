import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/project-attachments');

export interface IGetAttachments {
  id: number;
  fileName: string;
  lastModified: string;
  size: number;
  url: string;
}

/**
 * Pre-processes GET project attachments data
 *
 * @export
 * @class GetAttachmentsData
 */
export class GetAttachmentsData {
  attachmentsList: IGetAttachments[];

  constructor(attachmentsData?: any) {
    defaultLog.debug({ label: 'GetAttachmentsData', message: 'params', attachmentsData });

    this.attachmentsList =
      (attachmentsData?.length &&
        attachmentsData.map((item: any) => {
          return {
            id: item.project_attachment_id,
            fileName: item.file_name,
            lastModified: (item.update_date || item.create_date).toString(),
            size: item.file_size,
            url: item.url
          };
        })) ||
      [];
  }
}
