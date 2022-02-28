import { Metadata } from 'aws-sdk/clients/s3';
import { HTTP400 } from '../errors/custom-error';
import { GetAttachmentsData } from '../models/project-attachments';
import { queries } from '../queries/queries';
import { deleteFileFromS3, generateS3FileKey, getS3SignedURL, uploadFileToS3 } from '../utils/file-utils';
import { DBService } from './service';

export class AttachmentService extends DBService {
  async insertProjectAttachment(
    projectId: number,
    key: string,
    file: Express.Multer.File
  ): Promise<{ id: number; revision_count: number }> {
    const sqlStatement = queries.project.postProjectAttachmentSQL(file.originalname, file.size, projectId, key);

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
    metadata: Metadata = {}
  ): Promise<{ id: number; revision_count: number }> {
    const key = generateS3FileKey({ projectId: projectId, fileName: file.originalname });

    const response = (await this.fileWithSameNameExist(projectId, file))
      ? this.updateProjectAttachment(projectId, file)
      : this.insertProjectAttachment(projectId, key, file);

    await uploadFileToS3(file, key, metadata);

    return response;
  }

  async getAttachments(projectId: number) {
    const getProjectAttachmentsSQLStatement = queries.project.getProjectAttachmentsSQL(projectId);

    if (!getProjectAttachmentsSQLStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(
      getProjectAttachmentsSQLStatement.text,
      getProjectAttachmentsSQLStatement.values
    );

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

  async deleteAllAttachments(projectId: number) {
    const getProjectAttachmentSQLStatement = queries.project.getProjectAttachmentsSQL(projectId);

    if (!getProjectAttachmentSQLStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const attachments = await this.connection.query(
      getProjectAttachmentSQLStatement.text,
      getProjectAttachmentSQLStatement.values
    );

    if (!attachments || !attachments.rows) {
      throw new HTTP400('Failed to delete project attachments record');
    }

    await Promise.all(attachments.rows.map((attachment) => attachment.key).map(deleteFileFromS3));
  }
}
