import { expect } from 'chai';
import { describe } from 'mocha';
import { GetAttachmentsData } from './project-attachments';

describe('GetAttachmentsData', () => {
  describe('No values provided', () => {
    let getAttachmentsData: GetAttachmentsData;

    before(() => {
      getAttachmentsData = new GetAttachmentsData(null);
    });

    it('sets attachmentsList', function () {
      expect(getAttachmentsData.attachmentsList).to.eql([]);
    });
  });

  describe('All values provided with only create date', () => {
    let getAttachmentsData: GetAttachmentsData;

    const attachmentsData = [
      {
        project_attachment_id: 1,
        file_name: 'filename',
        create_date: '2020/04/04',
        file_size: 24,
        url: 'https://something.com'
      }
    ];

    before(() => {
      getAttachmentsData = new GetAttachmentsData(attachmentsData);
    });

    it('sets attachmentsList', function () {
      expect(getAttachmentsData.attachmentsList).to.eql([
        {
          id: 1,
          fileName: 'filename',
          lastModified: '2020/04/04',
          size: 24,
          url: 'https://something.com'
        }
      ]);
    });
  });
});
