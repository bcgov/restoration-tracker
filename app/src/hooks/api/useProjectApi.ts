import { AxiosInstance, CancelTokenSource } from 'axios';
import {
  IAddProjectParticipant,
  ICreateProjectRequest,
  ICreateProjectResponse,
  IGetProjectAttachmentsResponse,
  IGetProjectForViewResponse,
  IGetProjectParticipantsResponse,
  IGetProjectsListResponse,
  IGetProjectTreatmentsResponse,
  IGetUserProjectsListResponse,
  IPostTreatmentUnitResponse,
  IProjectAdvancedFilterRequest,
  IUploadAttachmentResponse,
  TreatmentSearchCriteria
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
   * Get all role and project ids for all projects a user is a participant (member) of.
   *
   * @param {number} userId
   * @return {*} {Promise<IGetProjectsListResponse[]>}
   */
  const getAllUserProjectsParticipation = async (userId: number): Promise<IGetUserProjectsListResponse[]> => {
    const { data } = await axios.get(`/api/user/${userId}/projects/participation/list`);
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
   * Get project treatments based on project ID
   *
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<IGetProjectTreatmentResponse>}
   */
  const getProjectTreatments = async (
    projectId: number,
    filterByYear?: TreatmentSearchCriteria
  ): Promise<IGetProjectTreatmentsResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/treatments/list`, {
      params: filterByYear,
      paramsSerializer: (params) => {
        return qs.stringify(params, { arrayFormat: 'repeat', filter: (_prefix, value) => value || undefined });
      }
    });

    return data;
  };

  /**
   * Get project treatments years based on project ID
   *
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<IGetProjectTreatmentResponse>}
   */
  const getProjectTreatmentsYears = async (projectId: number): Promise<{ year: number }[]> => {
    const { data } = await axios.get(`/api/project/${projectId}/treatments/year/list`);

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
   * @returns {*} {Promise<number>}
   */
  const deleteProjectAttachment = async (projectId: number, attachmentId: number): Promise<number> => {
    const { data } = await axios.delete(`/api/project/${projectId}/attachments/${attachmentId}/delete`);

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
        return qs.stringify(params, { arrayFormat: 'repeat', filter: (_prefix, value) => value || undefined });
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
   * Upload project treatment spacial files.
   *
   * @param {number} projectId
   * @param {File} file
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<string[]>}
   */
  const importProjectTreatmentSpatialFile = async (
    projectId: number,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<IPostTreatmentUnitResponse> => {
    const req_message = new FormData();

    req_message.append('media', file);

    const { data } = await axios.post(`/api/project/${projectId}/treatments/upload`, req_message, {
      cancelToken: cancelTokenSource?.token,
      onUploadProgress: onProgress
    });

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

  /**
   * Delete project treatment unit based on project and treatmentUnit ID
   *
   * @param {number} projectId
   * @param {number} treatmentUnitId
   * @returns {*} {Promise<number>}
   */
  const deleteProjectTreatmentUnit = async (projectId: number, treatmentUnitId: number): Promise<boolean> => {
    const { status } = await axios.delete(
      `/api/project/${projectId}/treatments/treatment-unit/${treatmentUnitId}/delete`
    );

    return status === 200;
  };

  /**
   * Delete project treatments based on project ID and year
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @returns {*} {Promise<void>}
   */
  const deleteProjectTreatments = async (projectId: number): Promise<boolean> => {
    const { status } = await axios.delete(`/api/project/${projectId}/treatments/delete`);

    return status === 200;
  };

  /**
   * Download an EML file containing the project meta data.
   *
   * @param {number} projectId
   * @return {*}  {Promise<{ fileData: string; fileName: string }>}
   */
  const downloadProjectEML = async (projectId: number): Promise<{ fileData: string; fileName: string }> => {
    const response = await axios.get<{ eml: string }>(`/api/project/${projectId}/export/eml`);

    const fileName =
      response.headers?.['content-disposition']?.split('filename=')[1].replace(/(^['"]|['"]$)/g, '') ||
      'project_eml.xml';

    return { fileData: response.data.eml, fileName: fileName };
  };

  return {
    getAllUserProjectsParticipation,
    getProjectsList,
    createProject,
    getProjectById,
    getProjectTreatmentsYears,
    importProjectTreatmentSpatialFile,
    deleteProjectTreatmentUnit,
    deleteProjectTreatments,
    getProjectTreatments,
    uploadProjectAttachments,
    updateProject,
    getProjectAttachments,
    deleteProjectAttachment,
    deleteFundingSource,
    addFundingSource,
    deleteProject,
    publishProject,
    getProjectParticipants,
    addProjectParticipants,
    removeProjectParticipant,
    updateProjectParticipantRole,
    getUserProjectsList,
    downloadProjectEML
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
   * Get project treatments based on project ID
   *
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<IGetProjectTreatmentResponse>}
   */
  const getProjectTreatments = async (
    projectId: number,
    filterByYear?: TreatmentSearchCriteria
  ): Promise<IGetProjectTreatmentsResponse> => {
    const { data } = await axios.get(`/api/public/project/${projectId}/treatments/list`, {
      params: filterByYear,
      paramsSerializer: (params) => {
        return qs.stringify(params, { arrayFormat: 'repeat', filter: (_prefix, value) => value || undefined });
      }
    });

    return data;
  };

  /**
   * Get project treatments years based on project ID
   *
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<IGetProjectTreatmentResponse>}
   */
  const getProjectTreatmentsYears = async (projectId: number): Promise<{ year: number }[]> => {
    const { data } = await axios.get(`/api/public/project/${projectId}/treatments/year/list`);

    return data;
  };

  /**
   * Download an EML file containing the project meta data.
   *
   * @param {number} projectId
   * @return {*}  {Promise<{ fileData: string; fileName: string }>}
   */
  const downloadProjectEML = async (projectId: number): Promise<{ fileData: string; fileName: string }> => {
    const response = await axios.get<{ eml: string }>(`/api/public/project/${projectId}/export/eml`);

    const fileName =
      response.headers?.['content-disposition']?.split('filename=')[1].replace(/(^['"]|['"]$)/g, '') ||
      'project_eml.xml';

    return { fileData: response.data.eml, fileName: fileName };
  };

  return {
    getProjectsList,
    getProjectForView,
    getProjectAttachments,
    getProjectTreatments,
    getProjectTreatmentsYears,
    downloadProjectEML
  };
};
