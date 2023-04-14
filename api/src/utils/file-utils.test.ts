import AWS from 'aws-sdk';
import { expect } from 'chai';
import { describe } from 'mocha';
import {
  deleteFileFromS3,
  generateS3FileKey,
  getS3SignedURL,
  _getClamAvScanner,
  _getObjectStoreBucketName,
  _getObjectStoreUrl,
  _getS3Client,
  _getS3KeyPrefix
} from './file-utils';

describe('_getS3Client', () => {
  it('should return an S3 client', () => {
    process.env.OBJECT_STORE_ACCESS_KEY_ID = 'aaaa';
    process.env.OBJECT_STORE_SECRET_KEY_ID = 'bbbb';

    const result = _getS3Client();
    expect(result).to.be.instanceOf(AWS.S3);
  });
});

describe('_getClamAvScanner', () => {
  it('should return a clamAv scanner client', () => {
    process.env.ENABLE_FILE_VIRUS_SCAN = 'true';
    process.env.CLAMAV_HOST = 'host';
    process.env.CLAMAV_PORT = '1111';

    const result = _getClamAvScanner();
    expect(result).to.not.be.null;
  });

  it('should return null if enable file virus scan is not set to true', () => {
    process.env.ENABLE_FILE_VIRUS_SCAN = 'false';
    process.env.CLAMAV_HOST = 'host';
    process.env.CLAMAV_PORT = '1111';

    const result = _getClamAvScanner();
    expect(result).to.be.null;
  });

  it('should return null if CLAMAV_HOST is not set', () => {
    process.env.ENABLE_FILE_VIRUS_SCAN = 'true';
    delete process.env.CLAMAV_HOST;
    process.env.CLAMAV_PORT = '1111';

    const result = _getClamAvScanner();
    expect(result).to.be.null;
  });

  it('should return null if CLAMAV_PORT is not set', () => {
    process.env.ENABLE_FILE_VIRUS_SCAN = 'true';
    process.env.CLAMAV_HOST = 'host';
    delete process.env.CLAMAV_PORT;

    const result = _getClamAvScanner();
    expect(result).to.be.null;
  });
});

describe('_getObjectStoreBucketName', () => {
  it('should return an object store bucket name', () => {
    process.env.OBJECT_STORE_BUCKET_NAME = 'test-bucket1';

    const result = _getObjectStoreBucketName();
    expect(result).to.equal('test-bucket1');
  });

  it('should return its default value', () => {
    delete process.env.OBJECT_STORE_BUCKET_NAME;

    const result = _getObjectStoreBucketName();
    expect(result).to.equal('');
  });
});

describe('_getObjectStoreUrl', () => {
  it('should return an object store bucket name', () => {
    process.env.OBJECT_STORE_URL = 'test-url1';

    const result = _getObjectStoreUrl();
    expect(result).to.equal('test-url1');
  });

  it('should return its default value', () => {
    delete process.env.OBJECT_STORE_URL;

    const result = _getObjectStoreUrl();
    expect(result).to.equal('nrs.objectstore.gov.bc.ca');
  });
});

describe('_getS3KeyPrefix', () => {
  it('should return an s3 key prefix', () => {
    process.env.S3_KEY_PREFIX = 'test-restoration';

    const result = _getS3KeyPrefix();
    expect(result).to.equal('test-restoration');
  });

  it('should return its default value', () => {
    delete process.env.S3_KEY_PREFIX;

    const result = _getS3KeyPrefix();
    expect(result).to.equal('restoration');
  });
});

describe('deleteFileFromS3', () => {
  it('returns null when no key specified', async () => {
    const result = await deleteFileFromS3((null as unknown) as string);

    expect(result).to.be.null;
  });
});

describe('getS3SignedURL', () => {
  it('returns null when no key specified', async () => {
    const result = await getS3SignedURL((null as unknown) as string);

    expect(result).to.be.null;
  });
});

describe('generateS3FileKey', () => {
  it('returns a project attachments key', async () => {
    const result = generateS3FileKey({ projectId: 1, fileType: 'attachments', fileName: 'testFileName' });

    expect(result).to.equal('restoration/projects/1/attachments/testFileName');
  });

  it('returns a project treatments key', async () => {
    const result = generateS3FileKey({ projectId: 1, fileType: 'treatments', fileName: 'testFileName' });

    expect(result).to.equal('restoration/projects/1/treatments/testFileName');
  });
});
