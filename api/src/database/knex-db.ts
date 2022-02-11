import { Knex, knex } from 'knex';
import { QueryResult, QueryResultRow } from 'pg';
import SQL, { SQLStatement } from 'sql-template-strings';
import { ApiExecuteSQLError, ApiGeneralError } from '../errors/custom-error';
import { getUserIdentifier, getUserIdentitySource } from '../utils/keycloak-utils';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('database/knex');

export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = Number(process.env.DB_PORT);
export const DB_USERNAME = process.env.DB_USER_API;
export const DB_PASSWORD = process.env.DB_USER_API_PASS;
export const DB_DATABASE = process.env.DB_DATABASE;

export const DB_POOL_SIZE: number = Number(process.env.DB_POOL_SIZE) || 20;
export const DB_CONNECTION_TIMEOUT: number = Number(process.env.DB_CONNECTION_TIMEOUT) || 0;
export const DB_IDLE_TIMEOUT: number = Number(process.env.DB_IDLE_TIMEOUT) || 10000;
export const DB_ACQUIRE_CONNECTION_TIMEOUT: number = Number(process.env.DB_IDLE_TIMEOUT) || 10000;

export const defaultKnexConfig: Knex.Config = {
  client: 'pg',
  connection: {
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    host: DB_HOST,
    port: DB_PORT,
    connectionTimeoutMillis: DB_CONNECTION_TIMEOUT
  },
  pool: {
    max: DB_POOL_SIZE,
    idleTimeoutMillis: DB_IDLE_TIMEOUT
  },
  acquireConnectionTimeout: DB_ACQUIRE_CONNECTION_TIMEOUT
};

// singleton knex pool instance used by the api
let KnexDB: Knex | undefined;

/**
 * Initializes the singleton knex instance used by the api.
 *
 * If the pool cannot be created successfully, `process.exit(1)` is called to terminate the API.
 * Why? The API is of no use if the database can't be reached.
 *
 * @param {Knex.Config} knexConfig
 * @return {*}  {void}
 */
export const initKnexDB = function (knexConfig: Knex.Config): void {
  if (KnexDB) {
    // knex has already been initialized, do nothing
    return;
  }

  defaultLog.debug({ label: 'create knex db', message: 'knex config', knexConfig });

  try {
    KnexDB = knex(knexConfig);
  } catch (error) {
    defaultLog.error({ label: 'create db pool', message: 'failed to create db pool', error });
    process.exit(1);
  }
};

/**
 * Get the singleton knex instance used by the api.
 *
 * Note: pool will be undefined if `initKnexDB` has not been called.
 *
 * @return {*}  {(Knex | undefined)}
 */
export const getKnexDB = function (): Knex | undefined {
  return KnexDB;
};

/**
 * Wraps Knex (which wraps pg), exposing various functions for use when making database calls.
 *
 * Usage Examples:
 *
 * // Create a new instance of KnexDBConnection
 * const connection = nwe KnexDBConnection(req['keycloak_token']);
 *
 * try {
 *   // open a new transaction
 *   await connection.open();
 *
 *   // Execute queries against the open transaction using the knex query builder language
 *   await connection.trx.select(<columns>).from('table');
 *   await connection.trx<ResponseInterface>('table').select(<columns>);
 *   await connection.trx.insert(<data>).into('table');
 *
 *   // Execute queries against the open transaction using raw sql
 *   const sqlStatement = SQL`select * from table where id = ${id}`;
 *   await connection.query(sqlStatement);
 *
 *   // commit changes
 *   await connection.commit();
 * } catch (error) {
 *   // rollback changes
 *   await connection.rollback();
 * }
 *
 * @export
 * @class KnexDBConnection
 */
export class KnexDBConnection {
  _token;
  _knexDB;

  _trx: Knex.Transaction | undefined = undefined;
  _systemUserId: number | undefined = undefined;

  /**
   * Creates an instance of KnexDBConnection.
   *
   * @param {object} keycloakToken
   * @memberof KnexDBConnection
   */
  constructor(keycloakToken: object) {
    this._token = keycloakToken;

    const knexDB = getKnexDB();

    if (!knexDB) {
      throw Error('KnexDB is not initialized');
    }

    this._knexDB = knexDB;
  }

  /**
   * Opens a new connection, begins a transaction, and sets the user context.
   *
   * Note: Does nothing if the connection is already open.
   *
   * @throws {Error} if called when knex db has not been initialized via `initKnexDB`
   * @memberof KnexDBConnection
   */
  async open(): Promise<Knex.Transaction> {
    if (this._trx) {
      return this._trx;
    }

    const knexDB = getKnexDB();

    if (!knexDB) {
      throw Error('KnexDB is not initialized');
    }

    this._knexDB = knexDB;

    this._trx = await this._knexDB.transaction();

    await this._setUserContext();

    return this._trx;
  }

  /**
   * Commits the transaction that was opened by calling `open`.
   *
   * @throws {Error} if the connection is not open.
   * @memberof KnexDBConnection
   */
  async commit() {
    if (!this._trx) {
      throw Error('KnexDBConnection is not open');
    }

    await this._trx.commit();

    this._trx = undefined;
  }

  /**
   * Rolls back the transaction, undoing any queries performed by this transaction.
   *
   * Note: Only rolls back queries of the last commit. If `commit` was never called, then all all queries will be
   * rolled back.
   *
   * @throws {Error} if the connection is not open
   * @memberof KnexDBConnection
   */
  async rollback() {
    if (!this._trx) {
      throw Error('KnexDBConnection is not open');
    }

    await this._trx.rollback();

    this._trx = undefined;
  }

  /**
   * Execute a raw sql statement against the open transaction.
   *
   * Note: This function only exists to enable backwards compatibility with `IDBConnection`.
   *
   * @template T
   * @param {string} text SQL text
   * @param {any[]} [values] SQL values array (optional)
   * @throws {Error} if the connection is not open
   * @return {*}  {Promise<QueryResult<T>>}
   * @memberof KnexDBConnection
   */
  async query<T extends QueryResultRow = any>(text: string, values?: any[]): Promise<QueryResult<T>> {
    if (!this._trx) {
      throw Error('KnexDBConnection is not open');
    }

    // Convert `text` (SQLStatement.text) and `values` (SQLStatement.values) back into a SQLStatement object.
    const sqlStatement = SQL([text.replace(/\$\d+/, '?')], ...(values || []));

    return (this.raw<T>(sqlStatement) as unknown) as Promise<QueryResult<T>>;
  }

  /**
   * Execute a raw sql statement against the open transaction.
   *
   * @template T
   * @param {SQLStatement} sqlStatement
   * @return {*}  {Promise<QueryResult<T>>}
   * @memberof KnexDBConnection
   */
  async raw<T = any>(sqlStatement: SQLStatement): Promise<QueryResult<T>> {
    if (!sqlStatement) {
      throw Error('sqlStatement is not defined');
    }

    if (!this._trx) {
      throw Error('KnexDBConnection is not open');
    }

    return (this._trx.raw<T>(sqlStatement.sql, sqlStatement.values) as unknown) as Promise<QueryResult<T>>;
  }

  /**
   * Get the open transaction.
   *
   * @readonly
   * @type {Knex.Transaction}
   * @throws {Error} if the connection is not open.
   * @memberof KnexDBConnection
   */
  get trx(): Knex.Transaction {
    if (!this._trx) {
      throw Error('KnexDBConnection is not open');
    }

    return this._trx;
  }

  /**
   * Get the system user id for the transactions current user context.
   *
   * @readonly
   * @type {number}
   * @throws {Error} if the connection is not open.
   * @memberof KnexDBConnection
   */
  systemUserId(): number {
    if (!this._trx) {
      throw Error('KnexDBConnection is not open');
    }

    return this._systemUserId as number;
  }

  /**
   * Set the user context.
   *
   * Sets `systemUserId` if successful.
   *
   * @memberof KnexDBConnection
   */
  async _setUserContext() {
    if (!this._trx) {
      throw Error('KnexDBConnection is not open');
    }
    const userIdentifier = getUserIdentifier(this._token);
    const userIdentitySource = getUserIdentitySource(this._token);
    if (!userIdentifier || !userIdentitySource) {
      throw new ApiGeneralError('Failed to identify authenticated user');
    }
    try {
      const sqlStatement = SQL`select api_set_context(${userIdentifier}, ${userIdentitySource});`;
      const response: QueryResult = await this._trx.raw(sqlStatement.sql, sqlStatement.values);
      this._systemUserId = response?.rows?.[0].api_set_context;
    } catch (error) {
      throw new ApiExecuteSQLError('Failed to set user context', [error as object]);
    }
  }
}

/**
 * A special instance of a KnexDBConnection where the system user context is set to the API's system user.
 *
 * Note: Use of this should be limited to requests that are impossible to initiated under a real user context (ie: when
 * an unknown user is requesting access to BioHub and therefore does not yet have a user in the system).
 *
 * @export
 * @class APIKnexDBConnection
 * @extends {KnexDBConnection}
 */
export class APIKnexDBConnection extends KnexDBConnection {
  constructor() {
    super({ preferred_username: 'restoration_api@database' });
  }
}
