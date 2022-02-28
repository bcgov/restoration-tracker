import * as fs from 'fs';
import { Knex } from 'knex';
import path from 'path';

const DB_RELEASE = 'release.0.3.1';

const DB_SCHEMA = process.env.DB_SCHEMA;

/**
 * Update `api_delete_project` procedure.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  const api_delete_project = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'api_delete_project.sql'));

  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    ${api_delete_project}
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('');
}
