import { KnexDBConnection } from '../database/knex-db';
import { HTTP400 } from '../errors/custom-error';
import { queries } from '../queries/queries';

/**
 * Get db character metadata constants.
 *
 * @param {string} constantName
 * @param {KnexDBConnection} connection
 * @return {*} {Promise<void>}
 */
export const getDbCharacterSystemMetaDataConstant = async (
  constantName: string,
  connection: KnexDBConnection
): Promise<string | null> => {
  const sqlStatement = queries.codes.getDbCharacterSystemMetaDataConstantSQL(constantName);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  return response.rows?.[0].constant || null;
};
