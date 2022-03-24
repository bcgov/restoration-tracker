import { SQL, SQLStatement } from 'sql-template-strings';

export type DBSystemConstant =
  | 'DATA_NOT_PROVIDED_MESSAGE'
  | 'ISO_8601_DATE_FORMAT_WITH_TIMEZONE'
  | 'ISO_8601_DATE_FORMAT_WITHOUT_TIME_TIMEZONE'
  | 'SYSTEM_ROLES_SYSTEM_ADMINISTRATOR';

export const getDbCharacterSystemConstantSQL = (constantName: DBSystemConstant): SQLStatement =>
  SQL`SELECT api_get_character_system_constant(${constantName}) as constant;`;

export const getDbNumericSystemConstantSQL = (constantName: DBSystemConstant): SQLStatement =>
  SQL`SELECT api_get_numeric_system_constant(${constantName}) as constant;`;

export type DBSystemMetadataConstant = 'ORGANIZATION_NAME_FULL' | 'ORGANIZATION_URL';

export const getDbCharacterSystemMetaDataConstantSQL = (constantName: DBSystemMetadataConstant): SQLStatement =>
  SQL`SELECT api_get_character_system_metadata_constant(${constantName}) as constant;`;

export const getDbNumericSystemMetaDataConstantSQL = (constantName: DBSystemMetadataConstant): SQLStatement =>
  SQL`SELECT api_get_numeric_system_metadata_constant(${constantName}) as constant;`;
