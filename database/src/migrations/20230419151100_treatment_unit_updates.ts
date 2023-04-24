import { Knex } from 'knex';

/**
 * Makes several updates to the `treatment_unit` table
 *  - Add new column `implemented`
 *  - Update column `reconnaissance_conducted`
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    -- Drop existing view
    set search_path=restoration_dapi_v1;
    drop view if exists treatment_unit;

    set search_path=restoration;

    -- Alter existing column, without check constraint
    alter table treatment_unit 
      alter column reconnaissance_conducted type varchar(50),
      alter column reconnaissance_conducted drop not null;
    comment on column treatment_unit.reconnaissance_conducted is 'Describes if reconnaissance was conducted for a treatment unit.';

    -- Migrate any existing data in existing column
    update table treatment_unit set reconnaissance_conducted = 'yes' where reconnaissance_conducted = 'Y';
    update table treatment_unit set reconnaissance_conducted = 'no' where reconnaissance_conducted = 'N';

    -- Alter existing column, add check constraint
    alter table treatment_unit 
      add check (reconnaissance_conducted in ('yes', 'no', 'not applicable'));

    -- Add new column
    alter table treatment_unit 
      add column implemented varchar(50),
      add check (implemented in ('yes', 'no', 'partial'));
    comment on column treatment_unit.implemented is 'Describes if treatment was implemented for a treatment unit.';

    -- Add missing comments
    comment on column treatment_unit.width is 'The width of the treatment unit in meters.';
    comment on column treatment_unit.length is 'The length of the treatment unit in meters.';

    -- Recreate view
    set search_path = restoration_dapi_v1;
    set role restoration_api;
    create or replace view treatment_unit as select * from restoration.treatment_unit;

    set role postgres;
    set search_path = restoration;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('');
}
