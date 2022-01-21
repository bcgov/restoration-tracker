-- smoketest_release.sql
-- run as db super user
\c restoration
set role postgres;
set search_path=restoration;

do $$
declare
  _count integer = 0;
  _system_user system_user%rowtype;
  _system_user_id system_user.system_user_id%type;
begin
  select * into _system_user from system_user where user_identifier = 'myIDIR';
  if _system_user.system_user_id is not null then
    delete from permit where system_user_id = _system_user.system_user_id;
    delete from administrative_activity where reported_system_user_id = _system_user.system_user_id;
    delete from administrative_activity where assigned_system_user_id = _system_user.system_user_id;
    delete from system_user_role where system_user_id = _system_user.system_user_id;
    delete from system_user where system_user_id = _system_user.system_user_id;
  end if;

  insert into system_user (user_identity_source_id, user_identifier, record_effective_date) values ((select user_identity_source_id from user_identity_source where name = 'IDIR' and record_end_date is null), 'myIDIR', now()) returning system_user_id into _system_user_id;
  insert into system_user_role (system_user_id, system_role_id) values (_system_user_id, (select system_role_id from system_role where name =  'System Administrator'));

  select count(1) into _count from system_user;
  assert _count > 1, 'FAIL system_user';
  select count(1) into _count from audit_log;
  assert _count > 1, 'FAIL audit_log';

  -- drop security context for subsequent roles to instantiate
  drop table restoration_context_temp;

  raise notice 'smoketest_release(1): PASS';
end
$$;

set role restoration_api;
set search_path to restoration_dapi_v1, restoration, public, topology;
do $$
declare
  _project_id project.project_id%type;
  _count integer = 0;
  _system_user_id system_user.system_user_id%type;
  _geography project_spatial_component.geography%type;
  _project_funding_source_id project_funding_source.project_funding_source_id%type;
  _project_attachment_id project_attachment.project_attachment_id%type;
  _treatment_unit_id treatment_unit.treatment_unit_id%type;
begin
  -- set security context
  select api_set_context('myIDIR', 'IDIR') into _system_user_id;
  --select api_set_context('restoration_api', 'DATABASE') into _system_user_id;

  select st_GeomFromEWKT('SRID=4326;POLYGON((-123.920288 48.592142,-123.667603 48.645205,-123.539886 48.536204,-123.583832 48.46978,-123.728027 48.460674,-123.868103 48.467959,-123.940887 48.5262,-123.920288 48.592142), (-103.920288 38.592142,-103.667603 38.645205,-103.539886 38.536204,-103.583832 38.46978,-103.728027 38.460674,-103.868103 38.467959,-103.940887 38.5262,-103.920288 38.592142))') into _geography;

  insert into project (name
    , objectives
    , start_date
    , end_date
    , coordinator_first_name
    , coordinator_last_name
    , coordinator_email_address
    , coordinator_agency_name
    , coordinator_public
    ) values (
    'project 10'
    , 'my objectives'
    , now()
    , now()+interval '1 day'
    , 'coordinator_first_name'
    , 'coordinator_last_name'
    , 'coordinator_email_address@nowhere.com'
    , 'coordinator_agency_name'
    , TRUE
    ) returning project_id into _project_id;

  insert into stakeholder_partnership (project_id, name) values (_project_id, 'test');
  insert into project_funding_source (project_id, investment_action_category_id, funding_amount, funding_start_date, funding_end_date, funding_source_project_id) values (_project_id, (select investment_action_category_id from investment_action_category where name = 'Action 1'), '$1,000.00', now(), now(), 'test') returning project_funding_source_id into _project_funding_source_id;
  --insert into project_funding_source (project_id, investment_action_category_id, funding_amount, funding_start_date, funding_end_date) values (_project_id, 43, '$1,000.00', now(), now());
  insert into project_iucn_action_classification (project_id, iucn_conservation_action_level_3_subclassification_id) values (_project_id, (select iucn_conservation_action_level_3_subclassification_id from iucn_conservation_action_level_3_subclassification where name = 'Primary Education'));
  insert into project_attachment (project_id, file_name, title, key, file_size, file_type) values (_project_id, 'test_filename.txt', 'test filename', 'projects/'||_project_id::text, 10000, 'video');
  insert into project_first_nation (project_id, first_nations_id) values (_project_id, (select first_nations_id from first_nations where name = 'Kitselas Nation'));
  insert into permit (system_user_id, number, type, issue_date, end_date) values (_system_user_id, '8377262', 'permit type', now(), now()+interval '1 day');
  insert into project_spatial_component (name, project_id, geography, project_spatial_component_type_id) values ('test project spatial', _project_id, _geography, (select project_spatial_component_type_id from project_spatial_component_type where name = 'Boundary'));

  select count(1) into _count from stakeholder_partnership;
  assert _count = 1, 'FAIL stakeholder_partnership';
  select count(1) into _count from project_funding_source;
  assert _count = 1, 'FAIL project_funding_source';
  select count(1) into _count from project_iucn_action_classification;
  assert _count = 1, 'FAIL project_iucn_action_classification';
  select count(1) into _count from project_attachment;
  assert _count = 1, 'FAIL project_attachment';
  select count(1) into _count from project_first_nation;
  assert _count = 1, 'FAIL project_first_nation';
  select count(1) into _count from permit;
  assert _count = 1, 'FAIL permit';
  select count(1) into _count from project_spatial_component;
  assert _count = 1, 'FAIL project_spatial_component';

  -- test treatments
  insert into treatment_unit (name, project_id, reconnaissance_conducted, natural_recovery, linear_feature_type_id) values ('test treatment unit', _project_id, 'N', 'N', (select linear_feature_type_id from linear_feature_type where name = 'Roads' and record_end_date is null)) returning treatment_unit_id into _treatment_unit_id;
  insert into treatment (name, treatment_unit_id, treatment_type_id) values ('test treatment', _treatment_unit_id, (select treatment_type_id from treatment_type where name = 'Mounding'));
  insert into treatment_unit_spatial_component (name, treatment_unit_id, geography, treatment_unit_spatial_component_type_id) values ('test treatment spatial', _treatment_unit_id, _geography, (select project_spatial_component_type_id from project_spatial_component_type where name = 'Boundary'));

  select count(1) into _count from treatment_unit;
  assert _count = 1, 'FAIL treatment_unit';
  select count(1) into _count from treatment;
  assert _count = 1, 'FAIL treatment';
  select count(1) into _count from treatment_unit_spatial_component;
  assert _count = 1, 'FAIL treatment_unit_spatial_component';

  -- test ancillary data
  delete from webform_draft;
  insert into webform_draft (system_user_id, name, data) values ((select system_user_id from system_user limit 1), 'my draft name', '{ "customer": "John Doe", "items": {"product": "Beer","qty": 6}}');
  select count(1) into _count from webform_draft;
  assert _count = 1, 'FAIL webform_draft';

  -- work ledger
  delete from administrative_activity;
  insert into administrative_activity (reported_system_user_id
    , administrative_activity_type_id
    , administrative_activity_status_type_id
    , description
    , data)
    values (_system_user_id
    , (select administrative_activity_type_id from administrative_activity_type where name = 'System Access')
    , (select administrative_activity_status_type_id from administrative_activity_status_type where name = 'Pending')
    , 'my activity'
    , '{ "customer": "John Doe", "items": {"product": "Beer","qty": 6}}')
  ;
  select count(1) into _count from administrative_activity;
  assert _count = 1, 'FAIL administrative_activity';

  insert into permit (system_user_id, project_id, number, type, issue_date, end_date, coordinator_first_name, coordinator_last_name, coordinator_email_address, coordinator_agency_name) values (_system_user_id, _project_id, '8377261', 'permit type', now(), now()+interval '1 day', 'first', 'last', 'nobody@nowhere.com', 'agency');

  -- delete project
  raise notice 'deleting data.';
  call api_delete_project(_project_id);

  raise notice 'smoketest_release(2): PASS';
end
$$;

delete from permit;
