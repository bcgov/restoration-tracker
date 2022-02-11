import { Request, Response } from 'express';
import { Knex } from 'knex';
import sinon from 'sinon';
import * as knexdb from '../database/knex-db';

/**
 * Creates a stubbed version of `KnexDBConnection` and registers stubs for each of its methods.
 *
 * Example 1:
 *
 *   registerKnexDBMock({ systemUserId: () => 20, open: () => { throw Error() });
 *
 * Example 2:
 *
 *   const knexDBMock = registerKnexDBMock();
 *
 *   knexDBMock.systemUserId.returns(20)
 *   knexDBMock.open.rejects(new Error())
 *
 * Example 3:
 *
 *   const knexDBMock = registerKnexDBMock({ systemUserId: () => 20 });
 *
 *   knexDBMock.open.rejects(new Error())
 *
 * @param {SinonOverridesType<KnexDBConnection>} [overrides]
 * @return {*}
 */
export const getMockDBConnection = (
  config?: { [key in keyof knexdb.KnexDBConnection]?: typeof knexdb.KnexDBConnection.prototype[key] }
) => {
  // Stub the `KnexDB` object returned by `getKnexDB`
  const knexStub = sinon.stub(Knex);
  sinon.stub(knexdb, 'getKnexDB').returns((knexStub as unknown) as Knex);

  // Create a stub instance of `KnexDBConnection`
  const stubKnexDBConnection = sinon.createStubInstance(knexdb.KnexDBConnection, {
    systemUserId: sinon.stub()
  });

  // Get all class properties from the stub instance
  const properties = Object.getOwnPropertyNames(stubKnexDBConnection);

  // Register a stub for each of the properties, and assign it back onto the stub instance
  properties.forEach((property: any) => {
    // Register stub for the property
    const stub = sinon.stub(knexdb.KnexDBConnection.prototype, property);

    if (config?.[property]) {
      // Pre-load an optional fake function
      stub.callsFake(config[property]);
    }

    // Assign the registered stub to the stub instance
    stubKnexDBConnection[property] = stub;
  });

  return stubKnexDBConnection;
};

export type ExtendedMockReq = MockReq & Request;
export class MockReq {
  query = {};
  params = {};
  body = {};
  files: any[] = [];
}

export type ExtendedMockRes = MockRes & Response;
export class MockRes {
  statusValue: any;
  status = sinon.fake((value: any) => {
    this.statusValue = value;

    return this;
  });

  jsonValue: any;
  json = sinon.fake((value: any) => {
    this.jsonValue = value;

    return this;
  });

  sendValue: any;
  send = sinon.fake((value: any) => {
    this.sendValue = value;

    return this;
  });
}

/**
 * Returns several mocks for testing RequestHandler responses.
 *
 * @return {*}
 */
export const getRequestHandlerMocks = () => {
  const mockReq = new MockReq() as ExtendedMockReq;

  const mockRes = new MockRes() as ExtendedMockRes;

  const mockNext = sinon.fake();

  return { mockReq, mockRes, mockNext };
};
