import { Knex } from 'knex';

/**
 * Apply Habitat Restoration Tracker release changes.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path=restoration_dapi_v1;

  drop view wldtaxonomic_units;

  set search_path=restoration;

  drop table wldtaxonomic_units cascade;

  COMMENT ON COLUMN project_species.wldtaxonomic_units_id IS 'Foreign key to taxonomy service describing the taxonomic unit of the record.';

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
