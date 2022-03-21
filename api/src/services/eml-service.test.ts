import { expect } from 'chai';
import { describe } from 'mocha';
import { getMockDBConnection } from '../__mocks__/db';
import { EmlService } from './eml-service';

describe.only('EmlService', () => {
  it('temp', () => {
    const dbConnection = getMockDBConnection();

    const emlService = new EmlService(dbConnection);

    const response = emlService.buildProjectEml();

    console.log(response);

    expect(response).not.to.be.null;
  });
});
