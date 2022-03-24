import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('models/public/project');

/**
 * Pre-processes GET /projects/{id} public (published) project data
 *
 * @export
 * @class GetPublicProjectData
 */
export class GetPublicProjectData {
  project_name: string;
  start_date: string;
  end_date: string;

  constructor(projectData?: any) {
    defaultLog.debug({ label: 'GetPublicProjectData', message: 'params', projectData });

    this.project_name = projectData?.name || '';
    this.start_date = projectData?.start_date || '';
    this.end_date = projectData?.end_date || '';
  }
}

/**
 * Pre-processes GET public (published) project attachments data
 *
 * @export
 * @class GetPublicAttachmentsData
 */
export class GetPublicAttachmentsData {
  attachmentsList: any[];

  constructor(attachmentsData?: any) {
    defaultLog.debug({ label: 'GetPublicAttachmentsData', message: 'params', attachmentsData });

    this.attachmentsList =
      (attachmentsData?.length &&
        attachmentsData.map((item: any) => {
          return {
            id: item.id,
            fileName: item.file_name,
            lastModified: item.update_date || item.create_date,
            size: item.file_size,
            securityToken: item.is_secured
          };
        })) ||
      [];
  }
}
