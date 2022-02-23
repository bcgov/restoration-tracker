import chai, { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as file_utils from '../utils/file-utils';
import { HTTPError } from '../errors/custom-error';
import { queries } from '../queries/queries';
import { getMockDBConnection } from '../__mocks__/db';
import { AttachmentService } from './attachment-service';
import { GetAttachmentsData } from '../models/project-attachments';
import { DeleteObjectOutput } from 'aws-sdk/clients/s3';

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

      const attachmentService = new AttachmentService(mockDBConnection);

      try {
        await attachmentService.insertProjectAttachment(projectId, key, file);
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

      const attachmentService = new AttachmentService(mockDBConnection);

      try {
        await attachmentService.insertProjectAttachment(projectId, key, file);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert project attachment data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns row on success', async () => {
      const mockRowObj = [{ id: 123 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'postProjectAttachmentSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const key = '1';
      const file = { originalname: 'file', size: 1 } as Express.Multer.File;

      const attachmentService = new AttachmentService(mockDBConnection);

      const result = await attachmentService.insertProjectAttachment(projectId, key, file);

      expect(result).to.equal(mockRowObj[0]);
    });
  });

  describe('checkFileWithSameNameExists', () => {
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
        await attachmentService.checkFileWithSameNameExists(projectId, file);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 409 response when file with the same name already exists', async () => {
      const mockRowObj = [{ id: 123 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectAttachmentByFileNameSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const file = { originalname: 'file', size: 1 } as Express.Multer.File;

      const attachmentService = new AttachmentService(mockDBConnection);

      try {
        await attachmentService.checkFileWithSameNameExists(projectId, file);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Project attachment with the same name already exist');
        expect((actualError as HTTPError).status).to.equal(409);
      }
    });
  });

  describe('uploadMedia', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return id on successful upload', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(AttachmentService.prototype, 'checkFileWithSameNameExists').resolves();
      sinon.stub(file_utils, 'uploadFileToS3').resolves({ Key: '1/1/test.txt' } as any);
      sinon.stub(AttachmentService.prototype, 'insertProjectAttachment').resolves({ id: 1 });

      const projectId = 1;
      const file = { originalname: 'file', size: 1 } as Express.Multer.File;

      const attachmentService = new AttachmentService(mockDBConnection);

      const result = await attachmentService.uploadMedia(projectId, file);

      expect(result.id).to.equal(1);
    });
  });

  describe('getAttachments', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();
      sinon.stub(queries.project, 'getProjectAttachmentsSQL').returns(null);

      const projectId = 1;

      const attachmentService = new AttachmentService(mockDBConnection);

      try {
        await attachmentService.getAttachments(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should return an empty array when no attachments are found', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectAttachmentsSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const attachmentService = new AttachmentService(mockDBConnection);

      const result = await attachmentService.getAttachments(projectId);

      expect(result.attachmentsList.length).to.equal(0);
    });

    it('should return an empty array when no attachments are found', async () => {
      const mockRowObj = [{ id: 123, file_name: 'sample', create_date: Date.now(), file_size: 1 }];
      const expectedResult = new GetAttachmentsData([{ ...mockRowObj[0], url: 'https://somthing.com/anything' }]);
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectAttachmentsSQL').returns(SQL`valid sql`);
      sinon.stub(file_utils, 'getS3SignedURL').resolves('https://somthing.com/anything');

      const projectId = 1;

      const attachmentService = new AttachmentService(mockDBConnection);

      const result = await attachmentService.getAttachments(projectId);

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

  describe('deleteAllAttachments', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();
      sinon.stub(queries.project, 'getProjectAttachmentsSQL').returns(null);

      const projectId = 1;

      const attachmentService = new AttachmentService(mockDBConnection);

      try {
        await attachmentService.deleteAllAttachments(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectAttachmentsSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const attachmentService = new AttachmentService(mockDBConnection);

      try {
        await attachmentService.deleteAllAttachments(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to delete project attachments record');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns void on success', async () => {
      const mockRowObj = [{ key: 123 }, { key: 234 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'deleteProjectAttachmentSQL').returns(SQL`valid sql`);
      sinon.stub(file_utils, 'deleteFileFromS3').resolves((null as any) as DeleteObjectOutput);

      const projectId = 1;

      const attachmentService = new AttachmentService(mockDBConnection);

      const result = await attachmentService.deleteAllAttachments(projectId);

      expect(result).to.equal(void 0);
    });
  });
});
