import { IProjectCoordinatorForm } from 'features/projects/components/ProjectCoordinatorForm';
import { IProjectPermitForm } from 'features/projects/components/ProjectPermitForm';

/**
 * Permit response object.
 *
 * @export
 * @interface IGetPermitsListResponse
 */
export interface IGetPermitsListResponse {
  id: number;
  number: string;
  type: string;
  coordinator_agency: string;
  project_name: string;
}

/**
 * Create permits request object.
 *
 * @export
 * @interface ICreatePermitsRequest
 */
export interface ICreatePermitsRequest extends IProjectCoordinatorForm, IProjectPermitForm {}

/**
 * Create permits response object.
 *
 * @export
 * @interface ICreatePermitsResponse
 */
export interface ICreatePermitsResponse {
  id: number;
}
