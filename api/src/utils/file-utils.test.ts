import { expect } from 'chai';
import { describe } from 'mocha';
import { deleteFileFromS3, generateS3FileKey, getS3SignedURL, S3Folder } from './file-utils';

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
  it('returns project file path', async () => {
    const result = generateS3FileKey({ projectId: 1, fileName: 'testFileName' });

    expect(result).to.equal('restoration-tracker/projects/1/testFileName');
  });

  it('returns project folder file path', async () => {
    const result = generateS3FileKey({ projectId: 1, folder: S3Folder.ATTACHMENTS, fileName: 'testFileName' });

    expect(result).to.equal('restoration-tracker/projects/1/attachments/testFileName');
  });
});
