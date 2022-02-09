import { QueryResult, QueryResultRow } from 'pg';
import SQL from 'sql-template-strings';
import { KnexDBConnection } from './knex-db';

export interface IDBConnection {
  /**
   * Opens a new connection, begins a transaction, and sets the user context.
   *
   * Note: Does nothing if the connection is already open.
   *
   * @memberof IDBConnection
   */
  open: () => Promise<void>;
  /**
   * Releases (closes) the connection.
   *
   * Note: Does nothing if the connection is already released.
   *
   * @memberof IDBConnection
   */
  release: () => void;
  /**
   * Commits the transaction that was opened by calling `.open()`.
   *
   * @throws If the connection is not open.
   * @memberof IDBConnection
   */
  commit: () => Promise<void>;
  /**
   * Rolls back the transaction, undoing any queries performed by this connection.
   *
   * @throws If the connection is not open.
   * @memberof IDBConnection
   */
  rollback: () => Promise<void>;
  /**
   * Performs a query against this connection, returning the results.
   *
   * @param {string} text SQL text
   * @param {any[]} [values] SQL values array (optional)
   * @return {*}  {(Promise<QueryResult<any>>)}
   * @throws If the connection is not open.
   * @memberof IDBConnection
   */
  query: <T extends QueryResultRow = any>(text: string, values?: any[]) => Promise<QueryResult<T>>;
  /**
   * Get the ID of the system user in context.
   *
   * Note: will always return `null` if the connection is not open.
   *
   * @memberof IDBConnection
   */
  systemUserId: () => number;
}

/**
 * Wraps the pg client, exposing various functions for use when making database calls.
 *
 * Usage Example:
 *
 * const connection = await getDBConnection(req['keycloak_token']);
 * try {
 *   await connection.open();
 *   await connection.query(sqlStatement1.text, sqlStatement1.values);
 *   await connection.query(sqlStatement2.text, sqlStatement2.values);
 *   await connection.query(sqlStatement3.text, sqlStatement3.values);
 *   await connection.commit();
 * } catch (error) {
 *   await connection.rollback();
 * } finally {
 *   connection.release();
 * }
 *
 * @param {object} keycloakToken
 * @return {*} {IDBConnection}
 *
 * @deprecated This continues to work, but it is now just a wrapper for `KnexDBConnection`.
 * Use `KnexDBConnection` directly instead.
 */
export const getDBConnection = function (keycloakToken: object): IDBConnection {
  if (!keycloakToken) {
    throw Error('Keycloak token is undefined');
  }

  const knexDBConnection = new KnexDBConnection(keycloakToken);

  /**
   * Opens a new connection, begins a transaction, and sets the user context.
   *
   * Note: Does nothing if the connection is already open.
   *
   * @throws {Error} if called when the DBPool has not been initialized via `initDBPool`
   */
  const _open = async () => {
    await knexDBConnection.open();
  };

  /**
   * Releases (closes) the connection.
   *
   * Note: Does nothing if the connection is already released.
   */
  const _release = () => {
    // do nothing
  };

  /**
   * Commits the transaction that was opened by calling `.open()`.
   *
   * @throws {Error} if the connection is not open
   */
  const _commit = async () => {
    await knexDBConnection.commit();
  };

  /**
   * Rolls back the transaction, undoing any queries performed by this connection.
   *
   * @throws {Error} if the connection is not open
   */
  const _rollback = async () => {
    await knexDBConnection.rollback();
  };

  /**
   * Performs a query against this connection, returning the results.
   *
   * @template T
   * @param {string} text SQL text
   * @param {any[]} [values] SQL values array (optional)
   * @throws {Error} if the connection is not open
   * @return {*}  {Promise<QueryResult<T>>}
   */
  const _query = async <T extends QueryResultRow = any>(text: string, values?: any[]): Promise<QueryResult<T>> => {
    /*
     * Convert the `text` (`SQLStatement.text`) and `values (`SQLStatement.values`) back into their raw template string
     * form and re-bundle into a `SQLStatement`
     *
     * Why? `Knex` expects a different sql string format from `pg`, which is produced by calling `SQLStatement.sql`.
     */
    const sqlStatement = SQL(text.split(/\$\d+/), ...(values || []));

    return knexDBConnection.raw(sqlStatement);
  };

  const _getSystemUserID = () => {
    return knexDBConnection.systemUserId();
  };

  return {
    open: _open,
    query: _query,
    release: _release,
    commit: _commit,
    rollback: _rollback,
    systemUserId: _getSystemUserID
  };
};

/**
 * Returns an IDBConnection where the system user context is set to the API's system user.
 *
 * Note: Use of this should be limited to requests that are impossible to initiated under a real user context (ie: when
 * an unknown user is requesting access to BioHub and therefore does not yet have a user in the system).
 *
 * @return {*}  {IDBConnection}
 */
export const getAPIUserDBConnection = (): IDBConnection => {
  return getDBConnection({ preferred_username: 'restoration_api@database' });
};
