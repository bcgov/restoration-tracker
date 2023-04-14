import { Metadata } from 'aws-sdk/clients/s3';
import { HTTP400 } from '../errors/custom-error';
import { GetAttachmentsData } from '../models/project-attachments';
import { queries } from '../queries/queries';
import { deleteFileFromS3, getS3SignedURL, S3FileType, uploadFileToS3 } from '../utils/file-utils';
import { DBService } from './service';

export class AttachmentService extends DBService {
  async insertProjectAttachment(
    projectId: number,
    s3Key: string,
    file: Express.Multer.File,
    attachmentType: S3FileType
  ): Promise<{ id: number; revision_count: number }> {
    const sqlStatement = queries.project.postProjectAttachmentSQL(
      file.originalname,
      file.size,
      projectId,
      s3Key,
      attachmentType
    );

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rows || !response.rows[0]) {
      throw new HTTP400('Failed to insert project attachment data');
    }

    return response.rows[0];
  }

  async updateProjectAttachment(
    projectId: number,
    file: Express.Multer.File
  ): Promise<{ id: number; revision_count: number }> {
    const sqlStatement = queries.project.putProjectAttachmentSQL(projectId, file.originalname);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL update statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response?.rows?.[0]) {
      throw new HTTP400('Failed to update project attachment data');
    }

    return response.rows[0];
  }

  async fileWithSameNameExist(projectId: number, file: Express.Multer.File) {
    const getSqlStatement = queries.project.getProjectAttachmentByFileNameSQL(projectId, file.originalname);

    if (!getSqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const getResponse = await this.connection.query(getSqlStatement.text, getSqlStatement.values);

    return getResponse && getResponse.rows && getResponse.rows.length > 0;
  }

  async uploadMedia(
    projectId: number,
    file: Express.Multer.File,
    s3Key: string,
    attachmentType: S3FileType,
    metadata: Metadata = {}
  ): Promise<{ id: number; revision_count: number }> {
    const response = (await this.fileWithSameNameExist(projectId, file))
      ? this.updateProjectAttachment(projectId, file)
      : this.insertProjectAttachment(projectId, s3Key, file, attachmentType);

    await uploadFileToS3(file, s3Key, metadata);

    return response;
  }

  async getAttachmentsByType(projectId: number, attachmentType?: S3FileType | S3FileType[]) {
    const getProjectAttachmentsKnexStatement = queries.project.getProjectAttachmentsKnex(projectId, attachmentType);

    const response = await this.connection.knex(getProjectAttachmentsKnexStatement);

    const rawAttachmentsData = response && response.rows ? response.rows : [];

    const rawAttachmentsDataWithUrl = await Promise.all(
      rawAttachmentsData.map(async (item) => ({ ...item, url: await getS3SignedURL(item.key) }))
    );

    return new GetAttachmentsData(rawAttachmentsDataWithUrl);
  }

  async deleteAttachment(projectId: number, attachmentId: number) {
    const sqlStatement = queries.project.deleteProjectAttachmentSQL(projectId, attachmentId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL delete project attachment statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rows || !response.rows[0]) {
      throw new HTTP400('Failed to delete project attachment record');
    }

    await deleteFileFromS3(response.rows[0].key);
  }

  async deleteAttachmentsByType(projectId: number, attachmentType: S3FileType) {
    const getProjectAttachmentsKnexStatement = queries.project.getProjectAttachmentsKnex(projectId, attachmentType);

    const attachments = await this.connection.knex(getProjectAttachmentsKnexStatement);

    if (!attachments || !attachments.rows) {
      throw new HTTP400('Failed to get project attachments type record');
    }

    for (const row of attachments.rows) {
      await deleteFileFromS3(row.key);
      await this.deleteAttachment(projectId, row.project_attachment_id);
    }
  }

  async deleteAllS3Attachments(projectId: number) {
    const getProjectAttachmentsKnexStatement = queries.project.getProjectAttachmentsKnex(projectId);

    const attachments = await this.connection.knex(getProjectAttachmentsKnexStatement);

    if (!attachments || !attachments.rows) {
      throw new HTTP400('Failed to get project attachments type record');
    }

    for (const row of attachments.rows) {
      await deleteFileFromS3(row.key);
    }
  }
}
