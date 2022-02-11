import { KnexDBConnection } from '../database/knex-db';

/**
 * Base class for services that require a database connection.
 *
 * @export
 * @class DBService
 */
export class DBService {
  connection: KnexDBConnection;

  constructor(connection: KnexDBConnection) {
    this.connection = connection;
  }
}
