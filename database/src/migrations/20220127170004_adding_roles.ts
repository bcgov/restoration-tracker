import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

enum NEW_SYSTEM_ROLE {
  SYSTEM_ADMIN = 'System Administrator',
  PROJECT_CREATOR = 'Creator',
  DATA_ADMINISTRATOR = 'Data Administrator'
}

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}';
  set search_path = ${DB_SCHEMA},public;

  insert into  ${DB_SCHEMA}.system_role (name, record_effective_date, description) values ('${NEW_SYSTEM_ROLE.PROJECT_CREATOR}', now(), '');
  insert into  ${DB_SCHEMA}.system_role (name, record_effective_date, description) values ('${NEW_SYSTEM_ROLE.DATA_ADMINISTRATOR}', now(), '');

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
