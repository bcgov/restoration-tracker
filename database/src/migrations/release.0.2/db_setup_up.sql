--  db_setup_up.sql
\set ON_ERROR_STOP on
-- drop the database
set role postgres;
\c postgres
drop database restoration;
drop role restoration_api;
create database restoration;
\c restoration

set client_min_messages=warning;

-- TODO: lock down public but allow access to postgis installed there
--REVOKE ALL PRIVILEGES ON SCHEMA public FROM PUBLIC;

-- set up spatial extensions
\i create_spatial_extensions.psql

-- set up project management schema
create schema if not exists restoration;
GRANT ALL ON SCHEMA restoration TO postgres;
set search_path = restoration, public;

-- setup restoration api schema
create schema if not exists restoration_dapi_v1;

-- setup api user
create user restoration_api password 'flatpass';
alter schema restoration_dapi_v1 owner to restoration_api;

-- Grant rights on restoration_dapi_v1 to restoration_api user
grant all on schema restoration_dapi_v1 to restoration_api;
grant all on schema restoration_dapi_v1 to postgres;
alter DEFAULT PRIVILEGES in SCHEMA restoration_dapi_v1 grant ALL on tables to restoration_api;
alter DEFAULT PRIVILEGES in SCHEMA restoration_dapi_v1 grant ALL on tables to postgres;

-- restoration grants
GRANT USAGE ON SCHEMA restoration TO restoration_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA restoration GRANT ALL ON TABLES TO restoration_api;

alter role restoration_api set search_path to restoration_dapi_v1, restoration, public, topology;

\i restoration.sql
\i populate_user_identity_source.sql
\i api_set_context.sql
\i tr_audit_trigger.sql
\i tr_generated_audit_triggers.sql
\i api_get_context_user_id.sql
\i api_get_context_system_user_role_id.sql
\i api_user_is_administrator.sql
\i tr_journal_trigger.sql
\i tr_generated_journal_triggers.sql
\i tr_project_funding_source.sql
\i tr_project.sql
\i tr_permit.sql
\i api_get_system_constant.sql
\i api_get_system_metadata_constant.sql

\i api_delete_project.sql

-- populate look up tables
\set QUIET on
\i populate_system_constant.sql
\i populate_first_nations.sql
\i populate_funding_source.sql
\i populate_investment_action_category.sql
\i populate_iucn_classifications.sql
\i populate_project_role.sql
\i populate_system_role.sql
\i populate_administrative_activity_type.sql
\i populate_administrative_activity_status_type.sql
\i populate_system_metadata_constant.sql
\i populate_project_spatial_component_type.sql
\i populate_treatment_unit_spatial_component_type.sql
\i populate_treatment_type.sql
\i populate_linear_feature_type.sql

\set QUIET off

 -- create the views
set search_path = restoration_dapi_v1;
set role restoration_api;
\i vw_generated_dapi_views.sql

set role postgres;
set search_path = restoration;
grant execute on function api_set_context(_system_user_identifier system_user.user_identifier%type, _user_identity_source_name user_identity_source.name%type) to restoration_api;
