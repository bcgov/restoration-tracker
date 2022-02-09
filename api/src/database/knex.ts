import { Knex, knex } from 'knex';
import { QueryResult } from 'pg';
import SQL, { SQLStatement } from 'sql-template-strings';
import { ApiExecuteSQLError, ApiGeneralError } from '../errors/custom-error';
import { getUserIdentifier, getUserIdentitySource } from '../utils/keycloak-utils';
import { getLogger } from '../utils/logger';
import {
  DB_ACQUIRE_CONNECTION_TIMEOUT,
  DB_CONNECTION_TIMEOUT,
  DB_DATABASE,
  DB_HOST,
  DB_IDLE_TIMEOUT,
  DB_PASSWORD,
  DB_POOL_SIZE,
  DB_PORT,
  DB_USERNAME
} from './db';

const defaultLog = getLogger('database/knex');

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

export interface IKnexDBConnection {
  /**
   * Opens a new connection, begins a transaction, and sets the user context.
   *
   * Note: Does nothing if the connection is already open.
   *
   * @return {*}  {(Promise<Knex.Transaction>)}
   * @memberof IKnexDBConnection
   */
  open: () => Promise<Knex.Transaction>;
  /**
   * Commits the transaction that was opened by calling `.open()`.
   *
   * @throws If the connection is not open.
   * @memberof IKnexDBConnection
   */
  commit: () => Promise<void>;
  /**
   * Rolls back the transaction, undoing any queries performed by this connection.
   *
   * @throws If the connection is not open.
   * @memberof IKnexDBConnection
   */
  rollback: () => Promise<void>;
  /**
   * Returns the open transaction.
   *
   * Usage Examples:
   *
   * const result = await myKnexConnection.trx().select().from('table')
   *
   * @param {(knexDB: Knex) => Knex.QueryBuilder<any, T>} queryBuilder any knex query builder
   * @return {*}  {(Promise<T>)}
   * @throws If the connection is not open.
   * @memberof IKnexDBConnection
   */
  trx: () => Knex.Transaction;
  /**
   * Performs a query against the open transaction, via Knex `raw`.
   *
   * Usage Examples:
   *
   * const sqlStatement = SQL`select * from table where id = ${id}`;
   * await connection.query(sqlStatement);
   *
   * @param {sqlStatement: SQLStatement} sqlStatement
   * @return {*}  {(Promise<QueryResult<T>>)}
   * @throws If the connection is not open.
   * @memberof IKnexDBConnection
   */
  query: <T = any>(sqlStatement: SQLStatement) => Promise<QueryResult<T>>;
  /**
   * Get the ID of the system user in context.
   *
   * Note: will always return `null` if the connection is not open.
   *
   * @memberof IKnexDBConnection
   */
  systemUserId: () => number | null;
}

/**
 * Wraps Knex (which wraps pg), exposing various functions for use when making database calls.
 *
 * Usage Examples:
 *
 * const connection = await getKnexDBConnection(req['keycloak_token']);
 * try {
 *   await connection.open(); // open a new transaction
 *
 *   await connection.query().select(<columns>).from('table');
 *
 *   await connection.query()<ResponseInterface>('table).select(<columns>);
 *
 *   await connection.query().insert(<data>).into('table');
 *
 *   const sqlStatement = SQL`select * from table where id = ${id}`;
 *   await connection.query().raw(sqlStatement.sql, sqlStatement.values);
 *
 *   await connection.query()<any valid Knex query builder functions>
 *
 *   await connection.commit(); // commit changes
 * } catch (error) {
 *   await connection.rollback(); // rollback changes
 * }
 *
 * @param {object} keycloakToken
 * @return {*} {IKnexDBConnection}
 */
export const getKnexDBConnection = function (keycloakToken: object): IKnexDBConnection {
  if (!keycloakToken) {
    throw Error('Keycloak token is undefined');
  }

  let _knexDB: Knex;

  let _trx: Knex.Transaction | undefined;

  let _isOpen = false;

  let _systemUserId: number | null = null;

  const _token = keycloakToken;

  /**
   * Opens a new connection, begins a transaction, and sets the user context.
   *
   * Note: Does nothing if the connection is already open.
   *
   * @throws {Error} if called when the DBPool has not been initialized via `initDBPool`
   */
  const _open = async (): Promise<Knex.Transaction> => {
    if (_trx && _isOpen) {
      return _trx;
    }

    const knexDB = getKnexDB();

    if (!knexDB) {
      throw Error('KnexDB is not initialized');
    }

    _knexDB = knexDB;

    _trx = await _knexDB.transaction();

    _isOpen = true;

    await _setUserContext();

    return _trx;
  };

  /**
   * Commits the transaction that was opened by calling `.open()`.
   *
   * @throws {Error} if the connection is not open
   */
  const _commit = async () => {
    if (!_trx || !_isOpen) {
      throw Error('KnexDBConnection is not open');
    }

    await _trx.commit;

    _isOpen = false;
  };

  /**
   * Rolls back the transaction, undoing any queries performed by this connection.
   *
   * @throws {Error} if the connection is not open
   */
  const _rollback = async () => {
    if (!_trx || !_isOpen) {
      throw Error('KnexDBConnection is not open');
    }

    await _trx.rollback;

    _isOpen = false;
  };

  const _transaction = (): Knex.Transaction => {
    if (!_trx || !_isOpen) {
      throw Error('KnexDBConnection is not open');
    }

    return _trx;
  };

  /**
   * Execute a raw sql statement against the open transaction.
   *
   * @template T
   * @param {SQLStatement} sqlStatement
   * @return {*}  {Promise<QueryResult<T>>}
   */
  const _query = async <T = any>(sqlStatement: SQLStatement): Promise<QueryResult<T>> => {
    if (!sqlStatement) {
      throw Error('sqlStatement is not defined');
    }

    if (!_trx || !_isOpen) {
      throw Error('KnexDBConnection is not open');
    }

    return ((await _trx.raw<T>(sqlStatement.sql, sqlStatement.values)) as unknown) as Promise<QueryResult<T>>;
  };

  /**
   * Get the system user id for the open transaction.
   *
   * @return {*}  {(number | null)}
   */
  const _getSystemUserID = (): number | null => {
    return _systemUserId;
  };

  /**
   * Set the user context.
   *
   * Sets the _systemUserId if successful.
   */
  const _setUserContext = async () => {
    if (!_trx || !_isOpen) {
      throw Error('KnexDBConnection is not open');
    }

    const userIdentifier = getUserIdentifier(_token);
    const userIdentitySource = getUserIdentitySource(_token);

    if (!userIdentifier || !userIdentitySource) {
      throw new ApiGeneralError('Failed to identify authenticated user');
    }

    try {
      const sqlStatement = SQL`select api_set_context(${userIdentifier}, ${userIdentitySource});`;

      const response: QueryResult = await _trx.raw(sqlStatement.sql, sqlStatement.values);

      _systemUserId = response?.rows?.[0].api_set_context;
    } catch (error) {
      throw new ApiExecuteSQLError('Failed to set user context', [error as object]);
    }
  };

  return {
    open: _open,
    trx: _transaction,
    query: _query,
    commit: _commit,
    rollback: _rollback,
    systemUserId: _getSystemUserID
  };
};
