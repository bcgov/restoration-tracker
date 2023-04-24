import { DeleteObjectOutput } from 'aws-sdk/clients/s3';
import chai, { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { getKnexQueryBuilder } from '../database/db';
import { HTTPError } from '../errors/custom-error';
import { GetAttachmentsData } from '../models/project-attachments';
import { queries } from '../queries/queries';
import * as file_utils from '../utils/file-utils';
import { getMockDBConnection } from '../__mocks__/db';
import { AttachmentService } from './attachment-service';

chai.use(sinonChai);

describe('AttachmentService', () => {
  describe('insertProjectAttachment', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();
      sinon.stub(queries.project, 'postProjectAttachmentSQL').returns(null);

      const projectId = 1;
      const key = '1';
      const file = { originalname: 'file', size: 1 } as Express.Multer.File;
      const type = 'attachments';

      const attachmentService = new AttachmentService(mockDBConnection);

      try {
        await attachmentService.insertProjectAttachment(projectId, key, file, type);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL insert statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'postProjectAttachmentSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const key = '1';
      const file = { originalname: 'file', size: 1 } as Express.Multer.File;
      const type = 'attachments';

      const attachmentService = new AttachmentService(mockDBConnection);

      try {
        await attachmentService.insertProjectAttachment(projectId, key, file, type);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert project attachment data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns row on success', async () => {
      const mockRowObj = [{ id: 123, revision_count: 0 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'postProjectAttachmentSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const key = '1';
      const file = { originalname: 'file', size: 1 } as Express.Multer.File;
      const type = 'attachments';

      const attachmentService = new AttachmentService(mockDBConnection);

      const result = await attachmentService.insertProjectAttachment(projectId, key, file, type);

      expect(result).to.equal(mockRowObj[0]);
    });
  });

  describe('updateProjectAttachment', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();
      sinon.stub(queries.project, 'putProjectAttachmentSQL').returns(null);

      const projectId = 1;
      const file = { originalname: 'file', size: 1 } as Express.Multer.File;

      const attachmentService = new AttachmentService(mockDBConnection);

      try {
        await attachmentService.updateProjectAttachment(projectId, file);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL update statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'putProjectAttachmentSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const file = { originalname: 'file', size: 1 } as Express.Multer.File;

      const attachmentService = new AttachmentService(mockDBConnection);

      try {
        await attachmentService.updateProjectAttachment(projectId, file);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to update project attachment data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns row on success', async () => {
      const mockRowObj = [{ id: 123, revision_count: 1 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'putProjectAttachmentSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const file = { originalname: 'file', size: 1 } as Express.Multer.File;

      const attachmentService = new AttachmentService(mockDBConnection);

      const result = await attachmentService.updateProjectAttachment(projectId, file);

      expect(result).to.equal(mockRowObj[0]);
    });
  });

  describe('fileWithSameNameExist', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();
      sinon.stub(queries.project, 'getProjectAttachmentByFileNameSQL').returns(null);

      const projectId = 1;
      const file = { originalname: 'file', size: 1 } as Express.Multer.File;

      const attachmentService = new AttachmentService(mockDBConnection);

      try {
        await attachmentService.fileWithSameNameExist(projectId, file);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should return true when file with the same name already exist', async () => {
      const mockRowObj = [{ id: 123 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectAttachmentByFileNameSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const file = { originalname: 'file', size: 1 } as Express.Multer.File;

      const attachmentService = new AttachmentService(mockDBConnection);

      const result = await attachmentService.fileWithSameNameExist(projectId, file);

      expect(result).to.equal(true);
    });

    it('should return false when file with the same name does not exist', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectAttachmentByFileNameSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const file = { originalname: 'file', size: 1 } as Express.Multer.File;

      const attachmentService = new AttachmentService(mockDBConnection);

      const result = await attachmentService.fileWithSameNameExist(projectId, file);

      expect(result).to.equal(false);
    });
  });

  describe('uploadMedia', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return id on successful upload, when file with same name does not exist', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(AttachmentService.prototype, 'fileWithSameNameExist').resolves(false);
      sinon.stub(file_utils, 'uploadFileToS3').resolves({ Key: '1/1/test.txt' } as any);
      sinon.stub(AttachmentService.prototype, 'insertProjectAttachment').resolves({ id: 1, revision_count: 0 });

      const projectId = 1;
      const file = { originalname: 'file', size: 1 } as Express.Multer.File;
      const key = '1';
      const type = 'attachments';

      const attachmentService = new AttachmentService(mockDBConnection);

      const result = await attachmentService.uploadMedia(projectId, file, key, type);

      expect(result.id).to.equal(1);
      expect(result.revision_count).to.equal(0);
    });

    it('should return id on successful upload, when file with same name exist', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(AttachmentService.prototype, 'fileWithSameNameExist').resolves(true);
      sinon.stub(file_utils, 'uploadFileToS3').resolves({ Key: '1/1/test.txt' } as any);
      sinon.stub(AttachmentService.prototype, 'updateProjectAttachment').resolves({ id: 1, revision_count: 1 });

      const projectId = 1;
      const file = { originalname: 'file', size: 1 } as Express.Multer.File;
      const key = '1';
      const type = 'attachments';

      const attachmentService = new AttachmentService(mockDBConnection);

      const result = await attachmentService.uploadMedia(projectId, file, key, type);

      expect(result.id).to.equal(1);
      expect(result.revision_count).to.equal(1);
    });
  });

  describe('getAttachments', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return an empty array when no attachments are found', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectAttachmentsKnex').returns(getKnexQueryBuilder());

      const projectId = 1;

      const attachmentService = new AttachmentService(mockDBConnection);

      const result = await attachmentService.getAttachmentsByType(projectId);

      expect(result.attachmentsList.length).to.equal(0);
    });

    it('should return an array when attachments are found', async () => {
      const mockRowObj = [{ id: 123, file_name: 'sample', create_date: Date.now(), file_size: 1 }];
      const expectedResult = new GetAttachmentsData([{ ...mockRowObj[0], url: 'https://somthing.com/anything' }]);
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ knex: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectAttachmentsKnex').returns(getKnexQueryBuilder());
      sinon.stub(file_utils, 'getS3SignedURL').resolves('https://somthing.com/anything');

      const projectId = 1;

      const attachmentService = new AttachmentService(mockDBConnection);

      const result = await attachmentService.getAttachmentsByType(projectId);

      expect(result.attachmentsList).to.have.same.deep.members(expectedResult.attachmentsList);
    });
  });

  describe('deleteAttachment', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();
      sinon.stub(queries.project, 'deleteProjectAttachmentSQL').returns(null);

      const projectId = 1;
      const attachmentId = 1;

      const attachmentService = new AttachmentService(mockDBConnection);

      try {
        await attachmentService.deleteAttachment(projectId, attachmentId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL delete project attachment statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'deleteProjectAttachmentSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const attachmentId = 1;

      const attachmentService = new AttachmentService(mockDBConnection);

      try {
        await attachmentService.deleteAttachment(projectId, attachmentId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to delete project attachment record');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns void on success', async () => {
      const mockRowObj = [{ key: 123 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'deleteProjectAttachmentSQL').returns(SQL`valid sql`);
      sinon.stub(file_utils, 'deleteFileFromS3').resolves((null as any) as DeleteObjectOutput);

      const projectId = 1;
      const attachmentId = 1;

      const attachmentService = new AttachmentService(mockDBConnection);

      const result = await attachmentService.deleteAttachment(projectId, attachmentId);

      expect(result).to.equal(void 0);
    });
  });

  describe('deleteAttachmentsByType', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ knex: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectAttachmentsKnex').returns(getKnexQueryBuilder());

      const projectId = 1;
      const fileType = 'attachments';

      const attachmentService = new AttachmentService(mockDBConnection);

      try {
        await attachmentService.deleteAttachmentsByType(projectId, fileType);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to get project attachments type record');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns void on success', async () => {
      const mockRowObj = [{ key: 123 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ knex: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectAttachmentsKnex').returns(getKnexQueryBuilder());
      sinon.stub(file_utils, 'deleteFileFromS3').resolves((null as any) as DeleteObjectOutput);
      sinon.stub(AttachmentService.prototype, 'deleteAttachment').resolves();

      const projectId = 1;
      const fileType = 'attachments';

      const attachmentService = new AttachmentService(mockDBConnection);

      const result = await attachmentService.deleteAttachmentsByType(projectId, fileType);

      expect(result).to.equal(void 0);
    });
  });

  describe('deleteAllAttachments', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();
      sinon.stub(queries.project, 'getProjectAttachmentsKnex').returns(getKnexQueryBuilder());

      const projectId = 1;

      const attachmentService = new AttachmentService(mockDBConnection);

      try {
        await attachmentService.deleteAllS3Attachments(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to get project attachments type record');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ knex: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectAttachmentsKnex').returns(getKnexQueryBuilder());

      const projectId = 1;

      const attachmentService = new AttachmentService(mockDBConnection);

      try {
        await attachmentService.deleteAllS3Attachments(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to get project attachments type record');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns void on success', async () => {
      const mockRowObj = [{ key: 123 }, { key: 234 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ knex: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectAttachmentsKnex').returns(getKnexQueryBuilder());
      sinon.stub(file_utils, 'deleteFileFromS3').resolves((null as any) as DeleteObjectOutput);

      const projectId = 1;

      const attachmentService = new AttachmentService(mockDBConnection);

      const result = await attachmentService.deleteAllS3Attachments(projectId);

      expect(result).to.equal(void 0);
    });
  });
});
