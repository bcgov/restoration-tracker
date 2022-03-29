import { IDBConnection } from '../database/db';

/**
 * Base class for services that require a database connection.
 *
 * @export
 * @class DBService
 */
export class DBService<T extends IDBConnection = IDBConnection> {
  protected connection: T;

  constructor(connection: T) {
    this.connection = connection;
  }
}
