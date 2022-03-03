import * as fs from 'fs';
import { Knex } from 'knex';
import path from 'path';

const DB_USER_API_PASS = process.env.DB_USER_API_PASS;
const DB_USER_API = process.env.DB_USER_API;

const DB_RELEASE = 'release.0.4';

/**
 * Apply restoration release changes.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  const create_spatial_extensions = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'create_spatial_extensions.psql'));

  const restoration_ddl = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'restoration.sql'));
  const populate_user_identity_source = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_user_identity_source.sql')
  );
  const api_set_context = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'api_set_context.sql'));

  const tr_audit_trigger = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'tr_audit_trigger.sql'));
  const tr_generated_audit_triggers = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'tr_generated_audit_triggers.sql')
  );
  const api_get_context_user_id = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'api_get_context_user_id.sql'));
  const api_get_context_system_user_role_id = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'api_get_context_system_user_role_id.sql')
  );
  const api_user_is_administrator = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'api_user_is_administrator.sql'));
  const tr_journal_trigger = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'tr_journal_trigger.sql'));
  const tr_generated_journal_triggers = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'tr_generated_journal_triggers.sql')
  );
  const tr_project_funding_source = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'tr_project_funding_source.sql'));
  const tr_project = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'tr_project.sql'));
  const tr_permit = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'tr_permit.sql'));
  const api_get_system_constant = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'api_get_system_constant.sql'));
  const api_get_system_metadata_constant = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'api_get_system_metadata_constant.sql')
  );

  const api_delete_project = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'api_delete_project.sql'));

  const populate_system_constants = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'populate_system_constant.sql'));
  const populate_first_nations = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'populate_first_nations.sql'));
  const populate_funding_source = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'populate_funding_source.sql'));
  const populate_investment_action_category = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_investment_action_category.sql')
  );
  const populate_iucn_classifications = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_iucn_classifications.sql')
  );
  const populate_project_role = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'populate_project_role.sql'));
  const populate_system_role = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'populate_system_role.sql'));
  const populate_administrative_activity_type = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_administrative_activity_type.sql')
  );
  const populate_administrative_activity_status_type = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_administrative_activity_status_type.sql')
  );

  const populate_system_metadata_constant = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_system_metadata_constant.sql')
  );
  const populate_project_spatial_component_type = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_project_spatial_component_type.sql')
  );
  const populate_treatment_type = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'populate_treatment_type.sql'));
  const populate_feature_type = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_feature_type.sql')
  );
  const populate_contact_type = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'populate_contact_type.sql'));
  const populate_caribou_population_unit = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_caribou_population_unit.sql')
  );
  const populate_wldtaxonomic_units = fs.readFileSync(
    path.join(__dirname, DB_RELEASE, 'populate_wldtaxonomic_units.sql')
  );

  const vw_generated_dapi_views = fs.readFileSync(path.join(__dirname, DB_RELEASE, 'vw_generated_dapi_views.sql'));

  await knex.raw(`
    -- set up spatial extensions
    ${create_spatial_extensions}

    -- set up restoration schema
    create schema if not exists restoration;
    GRANT ALL ON SCHEMA restoration TO postgres;
    set search_path = restoration, public;

    -- setup restoration api schema
    create schema if not exists restoration_dapi_v1;

    -- setup api user
    create user ${DB_USER_API} password '${DB_USER_API_PASS}';
    alter schema restoration_dapi_v1 owner to ${DB_USER_API};

    -- Grant rights on restoration_dapi_v1 to restoration_api user
    grant all on schema restoration_dapi_v1 to ${DB_USER_API};
    grant all on schema restoration_dapi_v1 to postgres;
    alter DEFAULT PRIVILEGES in SCHEMA restoration_dapi_v1 grant ALL on tables to ${DB_USER_API};
    alter DEFAULT PRIVILEGES in SCHEMA restoration_dapi_v1 grant ALL on tables to postgres;

    -- restoration grants
    GRANT USAGE ON SCHEMA restoration TO ${DB_USER_API};
    ALTER DEFAULT PRIVILEGES IN SCHEMA restoration GRANT ALL ON TABLES TO ${DB_USER_API};

    alter role ${DB_USER_API} set search_path to restoration_dapi_v1, restoration, public, topology;

    ${restoration_ddl}
    ${populate_user_identity_source}
    ${api_set_context}
    ${tr_audit_trigger}
    ${tr_generated_audit_triggers}
    ${api_get_context_user_id}
    ${api_get_context_system_user_role_id}
    ${api_user_is_administrator}
    ${tr_journal_trigger}
    ${tr_generated_journal_triggers}
    ${tr_project_funding_source}
    ${tr_project}
    ${tr_permit}
    ${api_get_system_constant}
    ${api_get_system_metadata_constant}

    ${api_delete_project}

    -- populate look up tables
    set search_path = restoration, public;
    ${populate_system_constants}
    ${populate_first_nations}
    ${populate_funding_source}
    ${populate_investment_action_category}
    ${populate_iucn_classifications}
    ${populate_project_role}
    ${populate_system_role}
    ${populate_administrative_activity_type}
    ${populate_administrative_activity_status_type}
    ${populate_system_metadata_constant}
    ${populate_project_spatial_component_type}
    ${populate_treatment_type}
    ${populate_feature_type}
    ${populate_contact_type}
    ${populate_caribou_population_unit}

    -- temporary external interface tables
    ${populate_wldtaxonomic_units}

    -- create the views
    set search_path = restoration_dapi_v1;
    set role restoration_api;
    ${vw_generated_dapi_views}

    set role postgres;
    set search_path = restoration;
    grant execute on function restoration.api_set_context(_system_user_identifier system_user.user_identifier%type, _user_identity_source_name user_identity_source.name%type) to ${DB_USER_API};
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP SCHEMA IF EXISTS restoration CASCADE;
    DROP SCHEMA IF EXISTS restoration_dapi_v1 CASCADE;
    DROP USER IF EXISTS ${DB_USER_API};
  `);
}
