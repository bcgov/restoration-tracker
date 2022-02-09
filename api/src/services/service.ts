import { IDBConnection } from '../database/db';
import { KnexDBConnection } from '../database/knex-db';

/**
 * Base class for services that require a database connection.
 *
 * @export
 * @class DBService
 */
export class DBService<T = IDBConnection | KnexDBConnection> {
  connection: T;

  constructor(connection: T) {
    this.connection = connection;
  }
}
