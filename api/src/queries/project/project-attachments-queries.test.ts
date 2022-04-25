import { expect } from 'chai';
import { describe } from 'mocha';
import {
  getProjectAttachmentsKnex,
  deleteProjectAttachmentSQL,
  postProjectAttachmentSQL,
  getProjectAttachmentByFileNameSQL,
  putProjectAttachmentSQL
} from './project-attachments-queries';

describe('getProjectAttachmentsSQL', () => {
  it('returns non null response when valid projectId provided', () => {
    const response = getProjectAttachmentsKnex(1);

    expect(response).to.not.be.null;
  });

  it('returns non null response when valid projectId and fileType provided', () => {
    const response = getProjectAttachmentsKnex(1, 'attachments');

    expect(response).to.not.be.null;
  });
});

describe('deleteProjectAttachmentSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteProjectAttachmentSQL((null as unknown) as number, 1);

    expect(response).to.be.null;
  });

  it('returns null response when null attachmentId provided', () => {
    const response = deleteProjectAttachmentSQL(1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid attachmentId provided', () => {
    const response = deleteProjectAttachmentSQL(1, 1);

    expect(response).to.not.be.null;
  });
});

describe('postProjectAttachmentSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = postProjectAttachmentSQL('name', 20, (null as unknown) as number, 'key', 'attachment');

    expect(response).to.be.null;
  });

  it('returns null response when null fileName provided', () => {
    const response = postProjectAttachmentSQL((null as unknown) as string, 20, 1, 'key', 'attachment');

    expect(response).to.be.null;
  });

  it('returns null response when null fileSize provided', () => {
    const response = postProjectAttachmentSQL('name', (null as unknown) as number, 1, 'key', 'attachment');

    expect(response).to.be.null;
  });

  it('returns null response when null key provided', () => {
    const response = postProjectAttachmentSQL('name', 2, 1, (null as unknown) as string, 'attachment');

    expect(response).to.be.null;
  });

  it('returns null response when null type provided', () => {
    const response = postProjectAttachmentSQL('name', 2, 1, 'key', (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns a SQLStatement when all fields are passed in as expected', () => {
    const response = postProjectAttachmentSQL('name', 2, 1, 'key', 'attachment');

    expect(response).to.not.be.null;
  });
});

describe('putProjectAttachmentSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = putProjectAttachmentSQL((null as unknown) as number, 'name');

    expect(response).to.be.null;
  });

  it('returns null response when null fileName provided', () => {
    const response = putProjectAttachmentSQL(1, (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns a SQLStatement when all fields are passed in as expected', () => {
    const response = putProjectAttachmentSQL(1, 'fileName');

    expect(response).to.not.be.null;
  });
});

describe('getProjectAttachmentByFileNameSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getProjectAttachmentByFileNameSQL((null as unknown) as number, 'name');

    expect(response).to.be.null;
  });

  it('returns null response when null fileName provided', () => {
    const response = getProjectAttachmentByFileNameSQL(1, (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId and fileName provided', () => {
    const response = getProjectAttachmentByFileNameSQL(1, 'name');

    expect(response).to.not.be.null;
  });
});
