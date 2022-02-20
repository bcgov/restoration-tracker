import { Metadata } from 'aws-sdk/clients/s3';
import { HTTP400 } from '../errors/custom-error';
import { GetAttachmentsData } from '../models/project-attachments';
import { queries } from '../queries/queries';
import { deleteFileFromS3, generateS3FileKey, getS3SignedURL, uploadFileToS3 } from '../utils/file-utils';
import { DBService } from './service';

export class AttachmentService extends DBService {
  private async insertProjectAttachment(
    file: Express.Multer.File,
    projectId: number,
    key: string
  ): Promise<{ id: number; revision_count: number }> {
    const sqlStatement = queries.project.postProjectAttachmentSQL(file.originalname, file.size, projectId, key);

    if (!sqlStatement) throw new HTTP400('Failed to build SQL insert statement');

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response?.rows?.[0]) throw new HTTP400('Failed to insert project attachment data');

    return response.rows[0];
  }

  private async updateProjectAttachment(
    file: Express.Multer.File,
    projectId: number
  ): Promise<{ id: number; revision_count: number }> {
    const sqlStatement = queries.project.putProjectAttachmentSQL(projectId, file.originalname);

    if (!sqlStatement) throw new HTTP400('Failed to build SQL update statement');

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response?.rows?.[0]) throw new HTTP400('Failed to update project attachment data');

    return response.rows[0];
  }

  async uploadMedia(
    projectId: number,
    file: Express.Multer.File,
    metadata: Metadata = {}
  ): Promise<{ id: number; revision_count: number }> {
    const getSqlStatement = queries.project.getProjectAttachmentByFileNameSQL(projectId, file.originalname);

    if (!getSqlStatement) throw new HTTP400('Failed to build SQL get statement');

    const key = generateS3FileKey({ projectId: projectId, fileName: file.originalname });
    const getResponse = await this.connection.query(getSqlStatement.text, getSqlStatement.values);

    const attachmentResult =
      getResponse && getResponse.rowCount > 0
        ? await this.updateProjectAttachment(file, projectId)
        : await this.insertProjectAttachment(file, projectId, key);

    await uploadFileToS3(file, key, metadata);

    return attachmentResult;
  }

  async getAttachments(projectId: number) {
    const getProjectAttachmentsSQLStatement = queries.project.getProjectAttachmentsSQL(projectId);

    if (!getProjectAttachmentsSQLStatement) throw new HTTP400('Failed to build SQL get statement');

    const rawAttachmentsData = await this.connection.query(
      getProjectAttachmentsSQLStatement.text,
      getProjectAttachmentsSQLStatement.values
    );

    return new GetAttachmentsData(
      !rawAttachmentsData || !rawAttachmentsData.rows
        ? []
        : await Promise.all(
            rawAttachmentsData.rows.map(async (item) => {
              const url = await getS3SignedURL(item.key);
              return { ...item, url };
            })
          )
    );
  }

  async deleteAttachment(attachmentId: number) {
    const sqlStatement = queries.project.deleteProjectAttachmentSQL(attachmentId);

    if (!sqlStatement) throw new HTTP400('Failed to build SQL delete project attachment statement');

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rowCount) throw new HTTP400('Failed to delete project attachment record');

    await deleteFileFromS3(response.rows[0].key);
  }

  async deleteAllAttachments(projectId: number) {
    const getProjectAttachmentSQLStatement = queries.project.getProjectAttachmentsSQL(projectId);

    if (!getProjectAttachmentSQLStatement) throw new HTTP400('Failed to build SQL get statement');

    const attachments = await this.connection.query(
      getProjectAttachmentSQLStatement.text,
      getProjectAttachmentSQLStatement.values
    );

    if (!attachments || !attachments.rows) throw new HTTP400('Failed to get project attachments');

    await Promise.all(attachments.rows.map((attachment) => attachment.key).map(deleteFileFromS3));
  }
}
