import { COMPLETION_STATUS } from '../../constants/status';
import moment from 'moment';
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
  completion_status: string;

  constructor(projectData?: any) {
    defaultLog.debug({ label: 'GetPublicProjectData', message: 'params', projectData });

    this.project_name = projectData?.name || '';
    this.start_date = projectData?.start_date || '';
    this.end_date = projectData?.end_date || '';
    this.completion_status =
      (projectData &&
        projectData.end_date &&
        moment(projectData.end_date).endOf('day').isBefore(moment()) &&
        COMPLETION_STATUS.COMPLETED) ||
      COMPLETION_STATUS.ACTIVE;
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
