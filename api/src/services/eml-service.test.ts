import { expect } from 'chai';
import { describe } from 'mocha';
import { getMockDBConnection } from '../__mocks__/db';
import { EmlService } from './eml-service';

describe.only('EmlService', () => {
  it('temp', async () => {
    const dbConnection = getMockDBConnection();

    const emlService = new EmlService({ projectId: 1 }, dbConnection);

    const response = await emlService.buildProjectEml();

    console.log(response);

    expect(response).not.to.be.null;
  });
});
