import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

/**
 * Removes the `description` column from the `treatment_unit` table, since
 * descriptions associated with Treatments is no longer required.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
		SET schema ${DB_SCHEMA};
		SET search_path = ${DB_SCHEMA}, public;
		ALTER TABLE 'treatment_unit' DROP COLUMN 'description';
	`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
