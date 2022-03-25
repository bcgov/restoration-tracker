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
