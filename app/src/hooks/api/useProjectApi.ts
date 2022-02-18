import { AxiosInstance, CancelTokenSource } from 'axios';
import {
  IAddProjectParticipant,
  ICreateProjectRequest,
  ICreateProjectResponse,
  IGetProjectAttachmentsResponse,
  IGetProjectForViewResponse,
  IGetProjectParticipantsResponse,
  IGetProjectsListResponse,
  IGetUserProjectsListResponse,
  IProjectAdvancedFilterRequest,
  IUploadAttachmentResponse
} from 'interfaces/useProjectApi.interface';
import qs from 'qs';

/**
 * Returns a set of supported api methods for working with projects.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useProjectApi = (axios: AxiosInstance) => {
  /**
   * Get projects from userId
   *
   * @param {number} userId
   * @return {*} {Promise<IGetProjectsListResponse[]>}
   */
  const getAllUserProjectsParticipation = async (userId: number): Promise<IGetUserProjectsListResponse[]> => {
    const { data } = await axios.get(`/api/user/${userId}/projects/participation/get`);
    return data;
  };

  /**
   * Get all projects a user is a participant (member) of.
   *
   * @param {number} userId
   * @return {*} {Promise<IGetProjectForViewResponse[]>}
   */
  const getUserProjectsList = async (userId: number): Promise<IGetProjectForViewResponse[]> => {
    const { data } = await axios.get(`/api/user/${userId}/projects/list`);
    return data;
  };

  /**
   * Get project attachments based on project ID
   *
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<IGetProjectAttachmentsResponse>}
   */
  const getProjectAttachments = async (projectId: number): Promise<IGetProjectAttachmentsResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/attachments/list`);

    return data;
  };

  /**
   * Delete project based on project ID
   *
   * @param {number} projectId
   * @returns {*} {Promise<boolean>}
   */
  const deleteProject = async (projectId: number): Promise<boolean> => {
    const { data } = await axios.delete(`/api/project/${projectId}/delete`);

    return data;
  };

  /**
   * Delete project attachment based on project and attachment ID
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @param {any} securityToken
   * @returns {*} {Promise<number>}
   */
  const deleteProjectAttachment = async (
    projectId: number,
    attachmentId: number,
    securityToken: any
  ): Promise<number> => {
    const { data } = await axios.post(`/api/project/${projectId}/attachments/${attachmentId}/delete`, {
      securityToken
    });

    return data;
  };

  /**
   * Get project attachment S3 url based on project and attachment ID
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @return {*}  {Promise<string>}
   */
  const getAttachmentSignedURL = async (projectId: number, attachmentId: number): Promise<string> => {
    const { data } = await axios.get(`/api/project/${projectId}/attachments/${attachmentId}/getSignedUrl`);

    return data;
  };

  /**
   * Get projects list (potentially based on filter criteria).
   *
   * @param {IProjectAdvancedFilterRequest} filterFieldData
   * @return {*}  {Promise<IGetProjectForViewResponse[]>}
   */
  const getProjectsList = async (
    filterFieldData?: IProjectAdvancedFilterRequest
  ): Promise<IGetProjectForViewResponse[]> => {
    const { data } = await axios.get(`/api/project/list`, {
      params: filterFieldData,
      paramsSerializer: (params) => {
        return qs.stringify(params, { arrayFormat: 'repeat', filter: (prefix, value) => value || undefined });
      }
    });

    return data;
  };

  /**
   * Get project details based on its ID for viewing purposes.
   *
   * @param {number} projectId
   * @return {*} {Promise<IGetProjectForViewResponse>}
   */
  const getProjectById = async (projectId: number): Promise<IGetProjectForViewResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/view`);

    return data;
  };

  /**
   * Update an existing project.
   *
   * @param {number} projectId
   * @param {IGetProjectForViewResponse} projectData
   * @return {*}  {Promise<any>}
   */
  const updateProject = async (projectId: number, projectData: IGetProjectForViewResponse): Promise<any> => {
    const { data } = await axios.put(`api/project/${projectId}/update`, projectData);

    return data;
  };

  /**
   * Create a new project.
   *
   * @param {ICreateProjectRequest} project
   * @return {*}  {Promise<ICreateProjectResponse>}
   */
  const createProject = async (project: ICreateProjectRequest): Promise<ICreateProjectResponse> => {
    const { data } = await axios.post('/api/project/create', project);

    return data;
  };

  /**
   * Upload project attachments.
   *
   * @param {number} projectId
   * @param {File} file
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<string[]>}
   */
  const uploadProjectAttachments = async (
    projectId: number,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<IUploadAttachmentResponse> => {
    const req_message = new FormData();

    req_message.append('media', file);

    const { data } = await axios.post(`/api/project/${projectId}/attachments/upload`, req_message, {
      cancelToken: cancelTokenSource?.token,
      onUploadProgress: onProgress
    });

    return data;
  };

  /**
   * Make security status of project attachment secure.
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @return {*}  {Promise<any>}
   */
  const makeAttachmentSecure = async (projectId: number, attachmentId: number): Promise<any> => {
    const { data } = await axios.put(`/api/project/${projectId}/attachments/${attachmentId}/makeSecure`);

    return data;
  };

  /**
   * Make security status of project attachment unsecure.
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @param {any} securityToken
   * @return {*}  {Promise<any>}
   */
  const makeAttachmentUnsecure = async (projectId: number, attachmentId: number, securityToken: any): Promise<any> => {
    const { data } = await axios.put(`/api/project/${projectId}/attachments/${attachmentId}/makeUnsecure`, {
      securityToken
    });

    return data;
  };

  /**
   * Delete funding source based on project and funding source ID
   *
   * @param {number} projectId
   * @param {number} pfsId
   * @returns {*} {Promise<any>}
   */
  const deleteFundingSource = async (projectId: number, pfsId: number): Promise<any> => {
    const { data } = await axios.delete(`/api/project/${projectId}/funding-sources/${pfsId}/delete`);

    return data;
  };

  /**
   * Add new funding source based on projectId
   *
   * @param {number} projectId
   * @returns {*} {Promise<any>}
   */
  const addFundingSource = async (projectId: number, fundingSource: any): Promise<any> => {
    const { data } = await axios.post(`/api/project/${projectId}/funding-sources/add`, fundingSource);

    return data;
  };

  /**
   * Publish/unpublish a project.
   *
   * @param {number} projectId the project id
   * @param {boolean} publish set to `true` to publish the project, `false` to unpublish the project.
   * @return {*}  {Promise<any>}
   */
  const publishProject = async (projectId: number, publish: boolean): Promise<any> => {
    const { data } = await axios.put(`/api/project/${projectId}/publish`, { publish: publish });
    return data;
  };

  /**
   * Get all project participants.
   *
   * @param {number} projectId
   * @return {*}  {Promise<IGetProjectParticipantsResponse>}
   */
  const getProjectParticipants = async (projectId: number): Promise<IGetProjectParticipantsResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/participants/get`);

    return data;
  };

  /**
   * Add new project participants.
   *
   * @param {number} projectId
   * @param {IAddProjectParticipant[]} participants
   * @return {*}  {Promise<boolean>} `true` if the request was successful, false otherwise.
   */
  const addProjectParticipants = async (
    projectId: number,
    participants: IAddProjectParticipant[]
  ): Promise<boolean> => {
    const { status } = await axios.post(`/api/project/${projectId}/participants/create`, { participants });

    return status === 200;
  };

  /**
   * Remove existing project participant.
   *
   * @param {number} projectId
   * @param {number} projectParticipationId
   * @return {*}  {Promise<boolean>} `true` if the request was successful, false otherwise.
   */
  const removeProjectParticipant = async (projectId: number, projectParticipationId: number): Promise<boolean> => {
    const { status } = await axios.delete(`/api/project/${projectId}/participants/${projectParticipationId}/delete`);

    return status === 200;
  };

  /**
   * Update project participant role.
   *
   * @param {number} projectId
   * @param {number} projectParticipationId
   * @param {string} role
   * @return {*}  {Promise<boolean>}
   */
  const updateProjectParticipantRole = async (
    projectId: number,
    projectParticipationId: number,
    roleId: number
  ): Promise<boolean> => {
    const { status } = await axios.put(`/api/project/${projectId}/participants/${projectParticipationId}/update`, {
      roleId
    });

    return status === 200;
  };

  return {
    getAllUserProjectsParticipation,
    getProjectsList,
    createProject,
    getProjectById,
    uploadProjectAttachments,
    updateProject,
    getProjectAttachments,
    getAttachmentSignedURL,
    deleteProjectAttachment,
    deleteFundingSource,
    addFundingSource,
    deleteProject,
    publishProject,
    makeAttachmentSecure,
    makeAttachmentUnsecure,
    getProjectParticipants,
    addProjectParticipants,
    removeProjectParticipant,
    updateProjectParticipantRole,
    getUserProjectsList
  };
};

export default useProjectApi;

/**
 * Returns a set of supported api methods for working with public (published) project records.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
export const usePublicProjectApi = (axios: AxiosInstance) => {
  /**
   * Get public facing (published) projects list.
   *
   * @return {*}  {Promise<IGetProjectsListResponse[]>}
   */
  const getProjectsList = async (): Promise<IGetProjectsListResponse[]> => {
    const { data } = await axios.get(`/api/public/projects`);

    return data;
  };

  /**
   * Get public (published) project details based on its ID for viewing purposes.
   *
   * @param {number} projectId
   * @return {*} {Promise<IGetProjectForViewResponse>}
   */
  const getProjectForView = async (projectId: number): Promise<IGetProjectForViewResponse> => {
    const { data } = await axios.get(`/api/public/project/${projectId}/view`);

    return data;
  };

  /**
   * Get public (published) project attachments based on project ID
   *
   * @param {number} projectId
   * @returns {*} {Promise<IGetProjectAttachmentsResponse>}
   */
  const getProjectAttachments = async (projectId: number): Promise<IGetProjectAttachmentsResponse> => {
    const { data } = await axios.get(`/api/public/project/${projectId}/attachments/list`);

    return data;
  };

  /**
   * Get public (published) project attachment S3 url based on project and attachment ID
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @returns {*} {Promise<string>}
   */
  const getAttachmentSignedURL = async (projectId: number, attachmentId: number): Promise<string> => {
    const { data } = await axios.get(`/api/public/project/${projectId}/attachments/${attachmentId}/getSignedUrl`);

    return data;
  };

  return {
    getProjectsList,
    getProjectForView,
    getProjectAttachments,
    getAttachmentSignedURL
  };
};
