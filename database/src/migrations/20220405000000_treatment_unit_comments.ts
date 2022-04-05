import { Knex } from 'knex';

const DB_SCHEMA = 'restoration'

/**
 * Apply restoration release changes.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
	await knex.raw(`
		SET schema ${DB_SCHEMA};
		SET search_path = ${DB_SCHEMA}, public;

		ALTER TABLE 'treatment_unit' DROP COLUMN 'comments';
	`);
}

export async function down(knex: Knex): Promise<void> {
	//
}
