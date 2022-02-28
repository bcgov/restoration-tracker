import * as fs from 'fs';
import { Knex } from 'knex';
import path from 'path';

const DB_RELEASE = 'release.0.3.1';

/**
 * Apply restoration release changes.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  const api_delete_project = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'api_delete_project.sql'));

  await knex.raw(`
    ${api_delete_project}
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  `);
}
