--
-- ER/Studio Data Architect SQL Code Generation
-- Project :      BioHub.DM1
--
-- Date Created : Friday, January 07, 2022 12:28:59
-- Target DBMS : PostgreSQL 10.x-12.x
--

-- 
-- TABLE: administrative_activity 
--

CREATE TABLE administrative_activity(
    administrative_activity_id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    administrative_activity_status_type_id    integer           NOT NULL,
    administrative_activity_type_id           integer           NOT NULL,
    reported_system_user_id                   integer           NOT NULL,
    assigned_system_user_id                   integer,
    description                               varchar(3000),
    data                                      json,
    notes                                     varchar(3000),
    create_date                               timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                               integer           NOT NULL,
    update_date                               timestamptz(6),
    update_user                               integer,
    revision_count                            integer           DEFAULT 0 NOT NULL,
    CONSTRAINT administrative_activity_pk PRIMARY KEY (administrative_activity_id)
)
;



COMMENT ON COLUMN administrative_activity.administrative_activity_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN administrative_activity.administrative_activity_status_type_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN administrative_activity.administrative_activity_type_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN administrative_activity.reported_system_user_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN administrative_activity.assigned_system_user_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN administrative_activity.description IS 'The description of the record.'
;
COMMENT ON COLUMN administrative_activity.data IS 'The json data associated with the record.'
;
COMMENT ON COLUMN administrative_activity.notes IS 'Notes associated with the record.'
;
COMMENT ON COLUMN administrative_activity.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN administrative_activity.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN administrative_activity.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN administrative_activity.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN administrative_activity.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE administrative_activity IS 'Administrative activity is a list of activities to be performed in order to maintain the business processes of the system.'
;

-- 
-- TABLE: administrative_activity_status_type 
--

CREATE TABLE administrative_activity_status_type(
    administrative_activity_status_type_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                                      varchar(50)       NOT NULL,
    record_end_date                           date,
    record_effective_date                     date              NOT NULL,
    description                               varchar(250),
    create_date                               timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                               integer           NOT NULL,
    update_date                               timestamptz(6),
    update_user                               integer,
    revision_count                            integer           DEFAULT 0 NOT NULL,
    CONSTRAINT administrative_activity_status_type_pk PRIMARY KEY (administrative_activity_status_type_id)
)
;



COMMENT ON COLUMN administrative_activity_status_type.administrative_activity_status_type_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN administrative_activity_status_type.name IS 'The name of the record.'
;
COMMENT ON COLUMN administrative_activity_status_type.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN administrative_activity_status_type.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN administrative_activity_status_type.description IS 'The description of the record.'
;
COMMENT ON COLUMN administrative_activity_status_type.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN administrative_activity_status_type.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN administrative_activity_status_type.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN administrative_activity_status_type.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN administrative_activity_status_type.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE administrative_activity_status_type IS 'Administrative activity status type describes a class of statuses that describe the state of an administrative activity record.'
;

-- 
-- TABLE: administrative_activity_type 
--

CREATE TABLE administrative_activity_type(
    administrative_activity_type_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                               varchar(50)       NOT NULL,
    record_end_date                    date,
    record_effective_date              date              NOT NULL,
    description                        varchar(250),
    create_date                        timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                        integer           NOT NULL,
    update_date                        timestamptz(6),
    update_user                        integer,
    revision_count                     integer           DEFAULT 0 NOT NULL,
    CONSTRAINT administrative_activity_type_pk PRIMARY KEY (administrative_activity_type_id)
)
;



COMMENT ON COLUMN administrative_activity_type.administrative_activity_type_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN administrative_activity_type.name IS 'The name of the record.'
;
COMMENT ON COLUMN administrative_activity_type.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN administrative_activity_type.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN administrative_activity_type.description IS 'The description of the record.'
;
COMMENT ON COLUMN administrative_activity_type.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN administrative_activity_type.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN administrative_activity_type.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN administrative_activity_type.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN administrative_activity_type.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE administrative_activity_type IS 'Administrative activity type describes a class of administrative activities that is performed in order to maintain the business processes of the application.'
;

-- 
-- TABLE: audit_log 
--

CREATE TABLE audit_log(
    audit_log_id      integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    system_user_id    integer         NOT NULL,
    create_date       TIMESTAMPTZ     DEFAULT now() NOT NULL,
    table_name        varchar(200)    NOT NULL,
    operation         varchar(20)     NOT NULL,
    before_value      json,
    after_value       json,
    CONSTRAINT audit_log_pk PRIMARY KEY (audit_log_id)
)
;



COMMENT ON COLUMN audit_log.audit_log_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN audit_log.system_user_id IS 'The system user id affecting the data change.'
;
COMMENT ON COLUMN audit_log.create_date IS 'The date and time of record creation.'
;
COMMENT ON COLUMN audit_log.table_name IS 'The table name of the data record.'
;
COMMENT ON COLUMN audit_log.operation IS 'The operation that affected the data change (ie. INSERT, UPDATE, DELETE, TRUNCATE).'
;
COMMENT ON COLUMN audit_log.before_value IS 'The JSON representation of the before value of the record.'
;
COMMENT ON COLUMN audit_log.after_value IS 'The JSON representation of the after value of the record.'
;
COMMENT ON TABLE audit_log IS 'Holds record level audit log data for the entire database.'
;

-- 
-- TABLE: first_nations 
--

CREATE TABLE first_nations(
    first_nations_id         integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(300)      NOT NULL,
    record_effective_date    date              NOT NULL,
    record_end_date          date,
    description              varchar(250),
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT first_nations_pk PRIMARY KEY (first_nations_id)
)
;



COMMENT ON COLUMN first_nations.first_nations_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN first_nations.name IS 'Name of the First Nation.'
;
COMMENT ON COLUMN first_nations.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN first_nations.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN first_nations.description IS 'The description of the record.'
;
COMMENT ON COLUMN first_nations.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN first_nations.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN first_nations.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN first_nations.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN first_nations.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE first_nations IS 'A list of first nations.'
;

-- 
-- TABLE: funding_source 
--

CREATE TABLE funding_source(
    funding_source_id        integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(100)      NOT NULL,
    record_end_date          date,
    record_effective_date    date              NOT NULL,
    description              varchar(250),
    project_id_optional      boolean           NOT NULL,
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT funding_source_pk PRIMARY KEY (funding_source_id)
)
;



COMMENT ON COLUMN funding_source.funding_source_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN funding_source.name IS 'The name of the funding source.'
;
COMMENT ON COLUMN funding_source.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN funding_source.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN funding_source.description IS 'The description of the record.'
;
COMMENT ON COLUMN funding_source.project_id_optional IS 'Provides whether the project id for the identified funding source is optional. A value of "Y" provides that the project id is optional and a value of "N" provides that the project id is not optional.'
;
COMMENT ON COLUMN funding_source.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN funding_source.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN funding_source.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN funding_source.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN funding_source.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE funding_source IS 'Agency or Ministry funding the project.'
;

-- 
-- TABLE: investment_action_category 
--

CREATE TABLE investment_action_category(
    investment_action_category_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    funding_source_id                integer           NOT NULL,
    name                             varchar(300),
    record_end_date                  date,
    record_effective_date            date              NOT NULL,
    description                      varchar(250),
    create_date                      timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                      integer           NOT NULL,
    update_date                      timestamptz(6),
    update_user                      integer,
    revision_count                   integer           DEFAULT 0 NOT NULL,
    CONSTRAINT investment_action_category_pk PRIMARY KEY (investment_action_category_id)
)
;



COMMENT ON COLUMN investment_action_category.investment_action_category_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN investment_action_category.funding_source_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN investment_action_category.name IS 'The name of the investment or action category.'
;
COMMENT ON COLUMN investment_action_category.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN investment_action_category.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN investment_action_category.description IS 'The description of the record.'
;
COMMENT ON COLUMN investment_action_category.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN investment_action_category.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN investment_action_category.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN investment_action_category.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN investment_action_category.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE investment_action_category IS 'The investment or action categories associated with the funding source. Funding sources may have no investment or action category thus the default category of Not Applicable is used.'
;

-- 
-- TABLE: iucn_conservation_action_level_1_classification 
--

CREATE TABLE iucn_conservation_action_level_1_classification(
    iucn_conservation_action_level_1_classification_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                                                  varchar(300),
    record_end_date                                       date,
    record_effective_date                                 date              NOT NULL,
    description                                           varchar(3000),
    create_date                                           timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                                           integer           NOT NULL,
    update_date                                           timestamptz(6),
    update_user                                           integer,
    revision_count                                        integer           DEFAULT 0 NOT NULL,
    CONSTRAINT iucn_conservation_action_level_1_classification_pk PRIMARY KEY (iucn_conservation_action_level_1_classification_id)
)
;



COMMENT ON COLUMN iucn_conservation_action_level_1_classification.iucn_conservation_action_level_1_classification_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN iucn_conservation_action_level_1_classification.name IS 'The name of the record.'
;
COMMENT ON COLUMN iucn_conservation_action_level_1_classification.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN iucn_conservation_action_level_1_classification.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN iucn_conservation_action_level_1_classification.description IS 'The description of the record.'
;
COMMENT ON COLUMN iucn_conservation_action_level_1_classification.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN iucn_conservation_action_level_1_classification.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN iucn_conservation_action_level_1_classification.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN iucn_conservation_action_level_1_classification.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN iucn_conservation_action_level_1_classification.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE iucn_conservation_action_level_1_classification IS 'List of IUCN conservation level 1 action classifications.'
;

-- 
-- TABLE: iucn_conservation_action_level_2_subclassification 
--

CREATE TABLE iucn_conservation_action_level_2_subclassification(
    iucn_conservation_action_level_2_subclassification_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    iucn_conservation_action_level_1_classification_id       integer           NOT NULL,
    name                                                     varchar(300),
    record_end_date                                          date,
    record_effective_date                                    date              NOT NULL,
    description                                              varchar(3000),
    create_date                                              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                                              integer           NOT NULL,
    update_date                                              timestamptz(6),
    update_user                                              integer,
    revision_count                                           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT iucn_conservation_action_level_2_subclassification_pk PRIMARY KEY (iucn_conservation_action_level_2_subclassification_id)
)
;



COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.iucn_conservation_action_level_2_subclassification_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.iucn_conservation_action_level_1_classification_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.name IS 'The name of the record.'
;
COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.description IS 'The description of the record.'
;
COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN iucn_conservation_action_level_2_subclassification.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE iucn_conservation_action_level_2_subclassification IS 'List of IUCN conservation action level 2 subclassifications.'
;

-- 
-- TABLE: iucn_conservation_action_level_3_subclassification 
--

CREATE TABLE iucn_conservation_action_level_3_subclassification(
    iucn_conservation_action_level_3_subclassification_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    iucn_conservation_action_level_2_subclassification_id    integer           NOT NULL,
    name                                                     varchar(300),
    record_end_date                                          date,
    record_effective_date                                    date              NOT NULL,
    description                                              varchar(3000),
    create_date                                              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                                              integer           NOT NULL,
    update_date                                              timestamptz(6),
    update_user                                              integer,
    revision_count                                           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT iucn_conservation_action_level_3_subclassification_pk PRIMARY KEY (iucn_conservation_action_level_3_subclassification_id)
)
;



COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.iucn_conservation_action_level_3_subclassification_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.iucn_conservation_action_level_2_subclassification_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.name IS 'The name of the IUCN action classification sublevel 2.
'
;
COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.description IS 'The description of the record.'
;
COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN iucn_conservation_action_level_3_subclassification.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE iucn_conservation_action_level_3_subclassification IS 'List of IUCN conservation action level 3 subclassifications.'
;

-- 
-- TABLE: permit 
--

CREATE TABLE permit(
    permit_id                    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    system_user_id               integer           NOT NULL,
    project_id                   integer           NOT NULL,
    number                       varchar(100)      NOT NULL,
    type                         varchar(300)      NOT NULL,
    coordinator_first_name       varchar(50),
    coordinator_last_name        varchar(50),
    coordinator_email_address    varchar(500),
    coordinator_agency_name      varchar(300),
    issue_date                   date,
    end_date                     date,
    create_date                  timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                  integer           NOT NULL,
    update_date                  timestamptz(6),
    update_user                  integer,
    revision_count               integer           DEFAULT 0 NOT NULL,
    CONSTRAINT permit_pk PRIMARY KEY (permit_id)
)
;



COMMENT ON COLUMN permit.permit_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN permit.system_user_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN permit.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN permit.number IS 'Permit number provided by FrontCounter BC.'
;
COMMENT ON COLUMN permit.type IS 'The tye of the permit.'
;
COMMENT ON COLUMN permit.coordinator_first_name IS 'The first name of the permit coordinator.'
;
COMMENT ON COLUMN permit.coordinator_last_name IS 'The last name of the permit coordinator.
'
;
COMMENT ON COLUMN permit.coordinator_email_address IS 'The email address.'
;
COMMENT ON COLUMN permit.coordinator_agency_name IS 'The permit coordinator agency name.'
;
COMMENT ON COLUMN permit.issue_date IS 'The date the permit was issued.'
;
COMMENT ON COLUMN permit.end_date IS 'The date the permit is no longer valid.'
;
COMMENT ON COLUMN permit.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN permit.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN permit.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN permit.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN permit.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE permit IS 'Provides a record of scientific permits. Note that permits are first class objects in the data model and do not require an association to either a project or survey. Additionally:
- Association to a survey or project implies that sampling was conducted related to the permit 
- No association to a survey or project implies that sampling was not conducted related to the permit
- Permits that are associated with a project should eventually be related to a survey
- Permits can be associated with one or zero projects
- Permits can only be associated with one survey
- Permits that have no association with a project or survey require values for coordinator first name, last name, email address and agency name

NOTE: there are conceptual problems with associating permits to projects early instead of at the survey level and these should be addressed in subsequent versions of the application.'
;

-- 
-- TABLE: project 
--

CREATE TABLE project(
    project_id                   integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    project_type_id              integer           NOT NULL,
    uuid                         uuid              DEFAULT public.gen_random_uuid(),
    name                         varchar(300),
    objectives                   varchar(3000)     NOT NULL,
    location_description         varchar(3000),
    start_date                   date              NOT NULL,
    end_date                     date,
    caveats                      varchar(3000),
    comments                     varchar(3000),
    coordinator_first_name       varchar(50)       NOT NULL,
    coordinator_last_name        varchar(50)       NOT NULL,
    coordinator_email_address    varchar(500)      NOT NULL,
    coordinator_agency_name      varchar(300)      NOT NULL,
    coordinator_public           boolean           NOT NULL,
    publish_timestamp            TIMESTAMPTZ,
    create_date                  timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                  integer           NOT NULL,
    update_date                  timestamptz(6),
    update_user                  integer,
    revision_count               integer           DEFAULT 0 NOT NULL,
    CONSTRAINT project_pk PRIMARY KEY (project_id)
)
;



COMMENT ON COLUMN project.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project.project_type_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project.uuid IS 'The universally unique identifier for the record.'
;
COMMENT ON COLUMN project.name IS 'Name given to a project.'
;
COMMENT ON COLUMN project.objectives IS 'The objectives for the project.'
;
COMMENT ON COLUMN project.location_description IS 'The location description.'
;
COMMENT ON COLUMN project.start_date IS 'The start date of the project.'
;
COMMENT ON COLUMN project.end_date IS 'The end date of the project.'
;
COMMENT ON COLUMN project.caveats IS 'Important stipulations, conditions, or limitations to the project results.'
;
COMMENT ON COLUMN project.comments IS 'Comments about the project.'
;
COMMENT ON COLUMN project.coordinator_first_name IS 'The first name of the person directly responsible for the project.'
;
COMMENT ON COLUMN project.coordinator_last_name IS 'The last name of the person directly responsible for the project.'
;
COMMENT ON COLUMN project.coordinator_email_address IS 'The coordinators email address.'
;
COMMENT ON COLUMN project.coordinator_agency_name IS 'Name of agency the project coordinator works for.'
;
COMMENT ON COLUMN project.coordinator_public IS 'A flag that determines whether personal coordinator details are public. A value of "Y" provides that personal details are public.'
;
COMMENT ON COLUMN project.publish_timestamp IS 'A timestamp that indicates that the project metadata has been approved for discovery. If the timestamp is not null then project metadata is public. If the timestamp is null the project metadata is not yet public.'
;
COMMENT ON COLUMN project.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project IS 'The top level organizational structure for project data collection. '
;

-- 
-- TABLE: project_attachment 
--

CREATE TABLE project_attachment(
    project_attachment_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    project_id               integer           NOT NULL,
    file_name                varchar(300)      NOT NULL,
    file_type                varchar(300),
    title                    varchar(300)      NOT NULL,
    description              varchar(3000),
    key                      varchar(1000)     NOT NULL,
    file_size                integer,
    security_token           uuid,
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT project_report_attachment_pk PRIMARY KEY (project_attachment_id)
)
;



COMMENT ON COLUMN project_attachment.project_attachment_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_attachment.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_attachment.file_name IS 'The name of the file attachment.'
;
COMMENT ON COLUMN project_attachment.file_type IS 'The attachment type. Attachment type examples include video, audio and field data.'
;
COMMENT ON COLUMN project_attachment.title IS 'The title of the file.'
;
COMMENT ON COLUMN project_attachment.description IS 'The description of the record.'
;
COMMENT ON COLUMN project_attachment.key IS 'The identifying key to the file in the storage system.'
;
COMMENT ON COLUMN project_attachment.file_size IS 'The size of the file in bytes.'
;
COMMENT ON COLUMN project_attachment.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.'
;
COMMENT ON COLUMN project_attachment.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_attachment.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_attachment.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_attachment.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_attachment.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_attachment IS 'A list of project attachments.'
;

-- 
-- TABLE: project_first_nation 
--

CREATE TABLE project_first_nation(
    project_first_nation_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    first_nations_id           integer           NOT NULL,
    project_id                 integer           NOT NULL,
    create_date                timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                integer           NOT NULL,
    update_date                timestamptz(6),
    update_user                integer,
    revision_count             integer           DEFAULT 0 NOT NULL,
    CONSTRAINT project_first_nation_pk PRIMARY KEY (project_first_nation_id)
)
;



COMMENT ON COLUMN project_first_nation.project_first_nation_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_first_nation.first_nations_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_first_nation.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_first_nation.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_first_nation.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_first_nation.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_first_nation.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_first_nation.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_first_nation IS 'A associative entity that joins projects and first nations.'
;

-- 
-- TABLE: project_funding_source 
--

CREATE TABLE project_funding_source(
    project_funding_source_id        integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    investment_action_category_id    integer           NOT NULL,
    project_id                       integer           NOT NULL,
    funding_source_project_id        varchar(50),
    funding_amount                   money             NOT NULL,
    funding_start_date               date              NOT NULL,
    funding_end_date                 date              NOT NULL,
    create_date                      timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                      integer           NOT NULL,
    update_date                      timestamptz(6),
    update_user                      integer,
    revision_count                   integer           DEFAULT 0 NOT NULL,
    CONSTRAINT project_funding_source_pk PRIMARY KEY (project_funding_source_id)
)
;



COMMENT ON COLUMN project_funding_source.project_funding_source_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_funding_source.investment_action_category_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_funding_source.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_funding_source.funding_source_project_id IS 'Idenfification number used by funding source to reference the project'
;
COMMENT ON COLUMN project_funding_source.funding_amount IS 'Funding amount from funding source.'
;
COMMENT ON COLUMN project_funding_source.funding_start_date IS 'Start date for funding from the source.'
;
COMMENT ON COLUMN project_funding_source.funding_end_date IS 'End date for funding from the source.'
;
COMMENT ON COLUMN project_funding_source.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_funding_source.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_funding_source.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_funding_source.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_funding_source.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_funding_source IS 'A associative entity that joins projects and funding source details.'
;

-- 
-- TABLE: project_iucn_action_classification 
--

CREATE TABLE project_iucn_action_classification(
    project_iucn_action_classification_id                    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    project_id                                               integer           NOT NULL,
    iucn_conservation_action_level_3_subclassification_id    integer           NOT NULL,
    create_date                                              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                                              integer           NOT NULL,
    update_date                                              timestamptz(6),
    update_user                                              integer,
    revision_count                                           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT project_iucn_action_classification_pk PRIMARY KEY (project_iucn_action_classification_id)
)
;



COMMENT ON COLUMN project_iucn_action_classification.project_iucn_action_classification_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_iucn_action_classification.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_iucn_action_classification.iucn_conservation_action_level_3_subclassification_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_iucn_action_classification.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_iucn_action_classification.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_iucn_action_classification.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_iucn_action_classification.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_iucn_action_classification.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_iucn_action_classification IS 'An associative entity that links projects and IUCN classifications.'
;

-- 
-- TABLE: project_participation 
--

CREATE TABLE project_participation(
    project_participation_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    project_id                  integer           NOT NULL,
    system_user_id              integer           NOT NULL,
    project_role_id             integer           NOT NULL,
    create_date                 timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                 integer           NOT NULL,
    update_date                 timestamptz(6),
    update_user                 integer,
    revision_count              integer           DEFAULT 0 NOT NULL,
    CONSTRAINT project_participation_pk PRIMARY KEY (project_participation_id)
)
;



COMMENT ON COLUMN project_participation.project_participation_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_participation.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_participation.system_user_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_participation.project_role_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_participation.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_participation.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_participation.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_participation.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_participation.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_participation IS 'A associative entity that joins projects, system users and project role types.'
;

-- 
-- TABLE: project_role 
--

CREATE TABLE project_role(
    project_role_id          integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)       NOT NULL,
    record_effective_date    date              NOT NULL,
    record_end_date          date,
    description              varchar(250)      NOT NULL,
    notes                    varchar(3000),
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT project_role_pk PRIMARY KEY (project_role_id)
)
;



COMMENT ON COLUMN project_role.project_role_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_role.name IS 'The name of the project role.'
;
COMMENT ON COLUMN project_role.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN project_role.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN project_role.description IS 'The description of the project role.'
;
COMMENT ON COLUMN project_role.notes IS 'Notes associated with the record.'
;
COMMENT ON COLUMN project_role.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_role.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_role.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_role.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_role.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_role IS 'Project participation roles.'
;

-- 
-- TABLE: project_spatial_component 
--

CREATE TABLE project_spatial_component(
    project_spatial_component_id         integer                     GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    project_id                           integer                     NOT NULL,
    project_spatial_component_type_id    integer                     NOT NULL,
    name                                 varchar(50)                 NOT NULL,
    description                          varchar(3000),
    geometry                             geometry(geometry, 3005),
    geography                            geography(geometry),
    geojson                              jsonb,
    create_date                          timestamptz(6)              DEFAULT now() NOT NULL,
    create_user                          integer                     NOT NULL,
    update_date                          timestamptz(6),
    update_user                          integer,
    revision_count                       integer                     DEFAULT 0 NOT NULL,
    CONSTRAINT project_spatial_component_pk PRIMARY KEY (project_spatial_component_id)
)
;



COMMENT ON COLUMN project_spatial_component.project_spatial_component_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_spatial_component.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_spatial_component.project_spatial_component_type_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_spatial_component.name IS 'The name of the record.'
;
COMMENT ON COLUMN project_spatial_component.description IS 'The description of the record.'
;
COMMENT ON COLUMN project_spatial_component.geometry IS 'The containing geometry of the record.'
;
COMMENT ON COLUMN project_spatial_component.geography IS 'The containing geography of the record.'
;
COMMENT ON COLUMN project_spatial_component.geojson IS 'A JSON representation of the geometry that provides necessary details for shape manipulation in client side tools.'
;
COMMENT ON COLUMN project_spatial_component.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_spatial_component.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_spatial_component.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_spatial_component.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_spatial_component.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_spatial_component IS 'Project spatial component persists the various spatial components that a project may include.'
;

-- 
-- TABLE: project_spatial_component_type 
--

CREATE TABLE project_spatial_component_type(
    project_spatial_component_type_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                                 varchar(300)      NOT NULL,
    record_effective_date                date              NOT NULL,
    record_end_date                      date,
    description                          varchar(250),
    create_date                          timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                          integer           NOT NULL,
    update_date                          timestamptz(6),
    update_user                          integer,
    revision_count                       integer           DEFAULT 0 NOT NULL,
    CONSTRAINT project_spatial_component_type_pk PRIMARY KEY (project_spatial_component_type_id)
)
;



COMMENT ON COLUMN project_spatial_component_type.project_spatial_component_type_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_spatial_component_type.name IS 'Name of the First Nation.'
;
COMMENT ON COLUMN project_spatial_component_type.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN project_spatial_component_type.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN project_spatial_component_type.description IS 'The description of the record.'
;
COMMENT ON COLUMN project_spatial_component_type.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_spatial_component_type.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_spatial_component_type.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_spatial_component_type.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_spatial_component_type.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_spatial_component_type IS 'A list of spatial component types.'
;

-- 
-- TABLE: project_type 
--

CREATE TABLE project_type(
    project_type_id          integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)       NOT NULL,
    record_effective_date    date              NOT NULL,
    description              varchar(250),
    record_end_date          date,
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT pk49_1_3_1 PRIMARY KEY (project_type_id)
)
;



COMMENT ON COLUMN project_type.project_type_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_type.name IS 'The name of the project role.'
;
COMMENT ON COLUMN project_type.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN project_type.description IS 'The description of the project type.'
;
COMMENT ON COLUMN project_type.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN project_type.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_type.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_type.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_type.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_type.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_type IS 'Broad classification for the project.'
;

-- 
-- TABLE: security 
--

CREATE TABLE security(
    security_id         integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    security_rule_id    integer           NOT NULL,
    system_user_id      integer,
    project_id          integer,
    security_token      uuid              NOT NULL,
    create_date         timestamptz(6)    DEFAULT now() NOT NULL,
    create_user         integer           NOT NULL,
    update_date         timestamptz(6),
    update_user         integer,
    revision_count      integer           DEFAULT 0 NOT NULL,
    CONSTRAINT security_pk PRIMARY KEY (security_id)
)
;



COMMENT ON COLUMN security.security_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN security.security_rule_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN security.system_user_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN security.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN security.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.'
;
COMMENT ON COLUMN security.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN security.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN security.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN security.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN security.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE security IS 'This is the security working table. This table does not need, journaling or audit trail as it is generated from the security rules. The tables contains references to the security rule, the security token of the secured object and the optional user id for when the rule applies to a specific user.'
;

-- 
-- TABLE: security_rule 
--

CREATE TABLE security_rule(
    security_rule_id         integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(300)      NOT NULL,
    rule_definition          json              NOT NULL,
    users                    json,
    system_rule              boolean           DEFAULT false,
    record_effective_date    date              NOT NULL,
    description              varchar(250),
    record_end_date          date,
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT security_rule_pk PRIMARY KEY (security_rule_id)
)
;



COMMENT ON COLUMN security_rule.security_rule_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN security_rule.name IS 'The name of the project role.'
;
COMMENT ON COLUMN security_rule.rule_definition IS 'The definition of the rule suitable for application in code to apply the security rule.'
;
COMMENT ON COLUMN security_rule.users IS 'The system user identifiers that the rule pertains to.'
;
COMMENT ON COLUMN security_rule.system_rule IS 'Indicator that this is a system rule and therefore gets skipped by the security rule engine.'
;
COMMENT ON COLUMN security_rule.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN security_rule.description IS 'The description of the project type.'
;
COMMENT ON COLUMN security_rule.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN security_rule.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN security_rule.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN security_rule.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN security_rule.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN security_rule.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE security_rule IS 'Security subsystem table to persist security rules.'
;

-- 
-- TABLE: stakeholder_partnership 
--

CREATE TABLE stakeholder_partnership(
    stakeholder_partnership_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    project_id                    integer           NOT NULL,
    name                          varchar(300),
    create_date                   timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                   integer           NOT NULL,
    update_date                   timestamptz(6),
    update_user                   integer,
    revision_count                integer           DEFAULT 0 NOT NULL,
    CONSTRAINT stakeholder_partnership_pk PRIMARY KEY (stakeholder_partnership_id)
)
;



COMMENT ON COLUMN stakeholder_partnership.stakeholder_partnership_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN stakeholder_partnership.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN stakeholder_partnership.name IS 'The name of the stakeholder.'
;
COMMENT ON COLUMN stakeholder_partnership.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN stakeholder_partnership.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN stakeholder_partnership.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN stakeholder_partnership.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN stakeholder_partnership.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE stakeholder_partnership IS 'Stakeholder partnerships associated with the project.'
;

-- 
-- TABLE: system_constant 
--

CREATE TABLE system_constant(
    system_constant_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    constant_name         varchar(50)       NOT NULL,
    character_value       varchar(300),
    numeric_value         numeric(10, 0),
    description           varchar(250),
    create_date           timestamptz(6)    DEFAULT now() NOT NULL,
    create_user           integer           NOT NULL,
    update_date           timestamptz(6),
    update_user           integer,
    revision_count        integer           DEFAULT 0 NOT NULL,
    CONSTRAINT system_constant_pk PRIMARY KEY (system_constant_id)
)
;



COMMENT ON COLUMN system_constant.system_constant_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_constant.constant_name IS 'The lookup name of the constant.'
;
COMMENT ON COLUMN system_constant.character_value IS 'The string value of the constant.'
;
COMMENT ON COLUMN system_constant.numeric_value IS 'The numeric value of the constant.'
;
COMMENT ON COLUMN system_constant.description IS 'The description of the record.'
;
COMMENT ON COLUMN system_constant.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN system_constant.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN system_constant.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN system_constant.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN system_constant.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE system_constant IS 'A list of system constants necessary for system functionality. Such constants are not editable by system administrators as they are used by internal logic.'
;

-- 
-- TABLE: system_metadata_constant 
--

CREATE TABLE system_metadata_constant(
    system_metadata_constant_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    constant_name                  varchar(50)       NOT NULL,
    character_value                varchar(300),
    numeric_value                  numeric(10, 0),
    description                    varchar(250),
    create_date                    timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                    integer           NOT NULL,
    update_date                    timestamptz(6),
    update_user                    integer,
    revision_count                 integer           DEFAULT 0 NOT NULL,
    CONSTRAINT system_metadata_constant_id_pk PRIMARY KEY (system_metadata_constant_id)
)
;



COMMENT ON COLUMN system_metadata_constant.system_metadata_constant_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_metadata_constant.constant_name IS 'The lookup name of the constant.'
;
COMMENT ON COLUMN system_metadata_constant.character_value IS 'The string value of the constant.'
;
COMMENT ON COLUMN system_metadata_constant.numeric_value IS 'The numeric value of the constant.'
;
COMMENT ON COLUMN system_metadata_constant.description IS 'The description of the record.'
;
COMMENT ON COLUMN system_metadata_constant.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN system_metadata_constant.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN system_metadata_constant.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN system_metadata_constant.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN system_metadata_constant.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE system_metadata_constant IS 'A list of system metadata constants associated with the business. Such constants are editable by system administrators and are used when publishing data.'
;

-- 
-- TABLE: system_role 
--

CREATE TABLE system_role(
    system_role_id           integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)       NOT NULL,
    record_effective_date    date              NOT NULL,
    record_end_date          date,
    description              varchar(250)      NOT NULL,
    notes                    varchar(3000),
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT system_role_pk PRIMARY KEY (system_role_id)
)
;



COMMENT ON COLUMN system_role.system_role_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_role.name IS 'The name of the record.'
;
COMMENT ON COLUMN system_role.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN system_role.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN system_role.description IS 'The description of the record.'
;
COMMENT ON COLUMN system_role.notes IS 'Notes associated with the record.'
;
COMMENT ON COLUMN system_role.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN system_role.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN system_role.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN system_role.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN system_role.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE system_role IS 'Agency or Ministry funding the project.'
;

-- 
-- TABLE: system_user 
--

CREATE TABLE system_user(
    system_user_id             integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    user_identity_source_id    integer           NOT NULL,
    user_identifier            varchar(200)      NOT NULL,
    record_effective_date      date              NOT NULL,
    record_end_date            date,
    create_date                timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                integer           NOT NULL,
    update_date                timestamptz(6),
    update_user                integer,
    revision_count             integer           DEFAULT 0 NOT NULL,
    CONSTRAINT system_user_pk PRIMARY KEY (system_user_id)
)
;



COMMENT ON COLUMN system_user.system_user_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_user.user_identity_source_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_user.user_identifier IS 'The identifier of the user.'
;
COMMENT ON COLUMN system_user.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN system_user.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN system_user.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN system_user.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN system_user.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN system_user.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN system_user.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE system_user IS 'Agency or Ministry funding the project.'
;

-- 
-- TABLE: system_user_role 
--

CREATE TABLE system_user_role(
    system_user_role_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    system_user_id         integer           NOT NULL,
    system_role_id         integer           NOT NULL,
    create_date            timestamptz(6)    DEFAULT now() NOT NULL,
    create_user            integer           NOT NULL,
    update_date            timestamptz(6),
    update_user            integer,
    revision_count         integer           DEFAULT 0 NOT NULL,
    CONSTRAINT system_user_role_pk PRIMARY KEY (system_user_role_id)
)
;



COMMENT ON COLUMN system_user_role.system_user_role_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_user_role.system_user_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_user_role.system_role_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_user_role.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN system_user_role.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN system_user_role.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN system_user_role.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN system_user_role.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE system_user_role IS 'A associative entity that joins system users and system role types.'
;

-- 
-- TABLE: user_identity_source 
--

CREATE TABLE user_identity_source(
    user_identity_source_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                       varchar(50)       NOT NULL,
    record_effective_date      date              NOT NULL,
    record_end_date            date,
    description                varchar(250),
    notes                      varchar(3000),
    create_date                timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                integer           NOT NULL,
    update_date                timestamptz(6),
    update_user                integer,
    revision_count             integer           DEFAULT 0 NOT NULL,
    CONSTRAINT user_identity_source_pk PRIMARY KEY (user_identity_source_id)
)
;



COMMENT ON COLUMN user_identity_source.user_identity_source_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN user_identity_source.name IS 'The name of the record.'
;
COMMENT ON COLUMN user_identity_source.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN user_identity_source.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN user_identity_source.description IS 'The description of the record.'
;
COMMENT ON COLUMN user_identity_source.notes IS 'Notes associated with the record.'
;
COMMENT ON COLUMN user_identity_source.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN user_identity_source.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN user_identity_source.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN user_identity_source.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN user_identity_source.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE user_identity_source IS 'The source of the user identifier. This source is traditionally the system that authenticates the user. Example sources could include IDIR, BCEID and DATABASE.'
;

-- 
-- TABLE: webform_draft 
--

CREATE TABLE webform_draft(
    webform_draft_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    system_user_id      integer           NOT NULL,
    name                varchar(300)      NOT NULL,
    data                json              NOT NULL,
    security_token      uuid,
    create_date         timestamptz(6)    DEFAULT now() NOT NULL,
    create_user         integer           NOT NULL,
    update_date         timestamptz(6),
    update_user         integer,
    revision_count      integer           DEFAULT 0 NOT NULL,
    CONSTRAINT webform_draft_pk PRIMARY KEY (webform_draft_id)
)
;



COMMENT ON COLUMN webform_draft.webform_draft_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN webform_draft.system_user_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN webform_draft.name IS 'The name of the draft record.'
;
COMMENT ON COLUMN webform_draft.data IS 'The json data associated with the record.'
;
COMMENT ON COLUMN webform_draft.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.'
;
COMMENT ON COLUMN webform_draft.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN webform_draft.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN webform_draft.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN webform_draft.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN webform_draft.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE webform_draft IS 'A persistent store for draft webform data. For example, if a user starts a project creation process and wants to save that information as a draft then the webform data can be persisted for subsequent reload into the project creation process.'
;

-- 
-- INDEX: "Ref78143" 
--

CREATE INDEX "Ref78143" ON administrative_activity(assigned_system_user_id)
;
-- 
-- INDEX: "Ref78144" 
--

CREATE INDEX "Ref78144" ON administrative_activity(reported_system_user_id)
;
-- 
-- INDEX: "Ref148145" 
--

CREATE INDEX "Ref148145" ON administrative_activity(administrative_activity_type_id)
;
-- 
-- INDEX: "Ref152146" 
--

CREATE INDEX "Ref152146" ON administrative_activity(administrative_activity_status_type_id)
;
-- 
-- INDEX: administrative_activity_status_type_nuk1 
--

CREATE UNIQUE INDEX administrative_activity_status_type_nuk1 ON administrative_activity_status_type(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: administrative_activity_type_nuk1 
--

CREATE UNIQUE INDEX administrative_activity_type_nuk1 ON administrative_activity_type(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: first_nations_nuk1 
--

CREATE UNIQUE INDEX first_nations_nuk1 ON first_nations(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: funding_source_nuk1 
--

CREATE UNIQUE INDEX funding_source_nuk1 ON funding_source(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: investment_action_category_nuk1 
--

CREATE UNIQUE INDEX investment_action_category_nuk1 ON investment_action_category(name, record_end_date, funding_source_id)
;
-- 
-- INDEX: "Ref73136" 
--

CREATE INDEX "Ref73136" ON investment_action_category(funding_source_id)
;
-- 
-- INDEX: iucn_conservation_action_level_1_classification_nuk1 
--

CREATE UNIQUE INDEX iucn_conservation_action_level_1_classification_nuk1 ON iucn_conservation_action_level_1_classification(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: iucn_conservation_action_level_2_subclassification_nuk1 
--

CREATE UNIQUE INDEX iucn_conservation_action_level_2_subclassification_nuk1 ON iucn_conservation_action_level_2_subclassification(name, record_end_date, iucn_conservation_action_level_1_classification_id)
;
-- 
-- INDEX: "Ref137121" 
--

CREATE INDEX "Ref137121" ON iucn_conservation_action_level_2_subclassification(iucn_conservation_action_level_1_classification_id)
;
-- 
-- INDEX: iucn_conservation_action_level_3_subclassification_nuk1 
--

CREATE UNIQUE INDEX iucn_conservation_action_level_3_subclassification_nuk1 ON iucn_conservation_action_level_3_subclassification(name, record_end_date, iucn_conservation_action_level_2_subclassification_id)
;
-- 
-- INDEX: "Ref139122" 
--

CREATE INDEX "Ref139122" ON iucn_conservation_action_level_3_subclassification(iucn_conservation_action_level_2_subclassification_id)
;
-- 
-- INDEX: permit_uk1 
--

CREATE UNIQUE INDEX permit_uk1 ON permit(number)
;
-- 
-- INDEX: "Ref45156" 
--

CREATE INDEX "Ref45156" ON permit(project_id)
;
-- 
-- INDEX: "Ref78171" 
--

CREATE INDEX "Ref78171" ON permit(system_user_id)
;
-- 
-- INDEX: "Ref128119" 
--

CREATE INDEX "Ref128119" ON project(project_type_id)
;
-- 
-- INDEX: project_report_attachment_uk1 
--

CREATE UNIQUE INDEX project_report_attachment_uk1 ON project_attachment(project_id, file_name)
;
-- 
-- INDEX: "Ref45197" 
--

CREATE INDEX "Ref45197" ON project_attachment(project_id)
;
-- 
-- INDEX: project_first_nation_uk1 
--

CREATE UNIQUE INDEX project_first_nation_uk1 ON project_first_nation(first_nations_id, project_id)
;
-- 
-- INDEX: "Ref127132" 
--

CREATE INDEX "Ref127132" ON project_first_nation(first_nations_id)
;
-- 
-- INDEX: "Ref45133" 
--

CREATE INDEX "Ref45133" ON project_first_nation(project_id)
;
-- 
-- INDEX: project_funding_source_uk1 
--

CREATE UNIQUE INDEX project_funding_source_uk1 ON project_funding_source(funding_source_project_id, investment_action_category_id, project_id)
;
-- 
-- INDEX: "Ref83137" 
--

CREATE INDEX "Ref83137" ON project_funding_source(investment_action_category_id)
;
-- 
-- INDEX: "Ref45138" 
--

CREATE INDEX "Ref45138" ON project_funding_source(project_id)
;
-- 
-- INDEX: project_iucn_action_classification_uk1 
--

CREATE UNIQUE INDEX project_iucn_action_classification_uk1 ON project_iucn_action_classification(project_id, iucn_conservation_action_level_3_subclassification_id)
;
-- 
-- INDEX: "Ref45123" 
--

CREATE INDEX "Ref45123" ON project_iucn_action_classification(project_id)
;
-- 
-- INDEX: "Ref140124" 
--

CREATE INDEX "Ref140124" ON project_iucn_action_classification(iucn_conservation_action_level_3_subclassification_id)
;
-- 
-- INDEX: project_participation_uk1 
--

CREATE UNIQUE INDEX project_participation_uk1 ON project_participation(project_id, system_user_id, project_role_id)
;
-- 
-- INDEX: "Ref45148" 
--

CREATE INDEX "Ref45148" ON project_participation(project_id)
;
-- 
-- INDEX: "Ref78149" 
--

CREATE INDEX "Ref78149" ON project_participation(system_user_id)
;
-- 
-- INDEX: "Ref100150" 
--

CREATE INDEX "Ref100150" ON project_participation(project_role_id)
;
-- 
-- INDEX: project_role_nuk1 
--

CREATE UNIQUE INDEX project_role_nuk1 ON project_role(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: project_spatial_component_uk1 
--

CREATE UNIQUE INDEX project_spatial_component_uk1 ON project_spatial_component(project_id, project_spatial_component_type_id, name)
;
-- 
-- INDEX: "Ref45211" 
--

CREATE INDEX "Ref45211" ON project_spatial_component(project_id)
;
-- 
-- INDEX: "Ref221212" 
--

CREATE INDEX "Ref221212" ON project_spatial_component(project_spatial_component_type_id)
;
-- 
-- INDEX: project_spatial_component_type_uk1 
--

CREATE UNIQUE INDEX project_spatial_component_type_uk1 ON project_spatial_component_type(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: project_type_nuk1 
--

CREATE UNIQUE INDEX project_type_nuk1 ON project_type(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: "Ref218208" 
--

CREATE INDEX "Ref218208" ON security(security_rule_id)
;
-- 
-- INDEX: "Ref78209" 
--

CREATE INDEX "Ref78209" ON security(system_user_id)
;
-- 
-- INDEX: "Ref45210" 
--

CREATE INDEX "Ref45210" ON security(project_id)
;
-- 
-- INDEX: stakeholder_partnership_uk1 
--

CREATE UNIQUE INDEX stakeholder_partnership_uk1 ON stakeholder_partnership(name, project_id)
;
-- 
-- INDEX: "Ref45126" 
--

CREATE INDEX "Ref45126" ON stakeholder_partnership(project_id)
;
-- 
-- INDEX: system_constant_uk1 
--

CREATE UNIQUE INDEX system_constant_uk1 ON system_constant(constant_name)
;
-- 
-- INDEX: system_metadata_constant_id_uk1 
--

CREATE UNIQUE INDEX system_metadata_constant_id_uk1 ON system_metadata_constant(constant_name)
;
-- 
-- INDEX: system_role_nuk1 
--

CREATE UNIQUE INDEX system_role_nuk1 ON system_role(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: system_user_nuk1 
--

CREATE UNIQUE INDEX system_user_nuk1 ON system_user(user_identifier, record_end_date, user_identity_source_id)
;
-- 
-- INDEX: "Ref120120" 
--

CREATE INDEX "Ref120120" ON system_user(user_identity_source_id)
;
-- 
-- INDEX: system_user_role_uk1 
--

CREATE UNIQUE INDEX system_user_role_uk1 ON system_user_role(system_user_id, system_role_id)
;
-- 
-- INDEX: "Ref78139" 
--

CREATE INDEX "Ref78139" ON system_user_role(system_user_id)
;
-- 
-- INDEX: "Ref79140" 
--

CREATE INDEX "Ref79140" ON system_user_role(system_role_id)
;
-- 
-- INDEX: user_identity_source_nuk1 
--

CREATE UNIQUE INDEX user_identity_source_nuk1 ON user_identity_source(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: "Ref78141" 
--

CREATE INDEX "Ref78141" ON webform_draft(system_user_id)
;
-- 
-- TABLE: administrative_activity 
--

ALTER TABLE administrative_activity ADD CONSTRAINT "Refsystem_user143" 
    FOREIGN KEY (assigned_system_user_id)
    REFERENCES system_user(system_user_id)
;

ALTER TABLE administrative_activity ADD CONSTRAINT "Refsystem_user144" 
    FOREIGN KEY (reported_system_user_id)
    REFERENCES system_user(system_user_id)
;

ALTER TABLE administrative_activity ADD CONSTRAINT "Refadministrative_activity_type145" 
    FOREIGN KEY (administrative_activity_type_id)
    REFERENCES administrative_activity_type(administrative_activity_type_id)
;

ALTER TABLE administrative_activity ADD CONSTRAINT "Refadministrative_activity_status_type146" 
    FOREIGN KEY (administrative_activity_status_type_id)
    REFERENCES administrative_activity_status_type(administrative_activity_status_type_id)
;


-- 
-- TABLE: investment_action_category 
--

ALTER TABLE investment_action_category ADD CONSTRAINT "Reffunding_source136" 
    FOREIGN KEY (funding_source_id)
    REFERENCES funding_source(funding_source_id)
;


-- 
-- TABLE: iucn_conservation_action_level_2_subclassification 
--

ALTER TABLE iucn_conservation_action_level_2_subclassification ADD CONSTRAINT "Refiucn_conservation_action_level_1_classification121" 
    FOREIGN KEY (iucn_conservation_action_level_1_classification_id)
    REFERENCES iucn_conservation_action_level_1_classification(iucn_conservation_action_level_1_classification_id)
;


-- 
-- TABLE: iucn_conservation_action_level_3_subclassification 
--

ALTER TABLE iucn_conservation_action_level_3_subclassification ADD CONSTRAINT "Refiucn_conservation_action_level_2_subclassification122" 
    FOREIGN KEY (iucn_conservation_action_level_2_subclassification_id)
    REFERENCES iucn_conservation_action_level_2_subclassification(iucn_conservation_action_level_2_subclassification_id)
;


-- 
-- TABLE: permit 
--

ALTER TABLE permit ADD CONSTRAINT "Refproject156" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id)
;

ALTER TABLE permit ADD CONSTRAINT "Refsystem_user171" 
    FOREIGN KEY (system_user_id)
    REFERENCES system_user(system_user_id)
;


-- 
-- TABLE: project 
--

ALTER TABLE project ADD CONSTRAINT "Refproject_type119" 
    FOREIGN KEY (project_type_id)
    REFERENCES project_type(project_type_id)
;


-- 
-- TABLE: project_attachment 
--

ALTER TABLE project_attachment ADD CONSTRAINT "Refproject197" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id)
;


-- 
-- TABLE: project_first_nation 
--

ALTER TABLE project_first_nation ADD CONSTRAINT "Reffirst_nations132" 
    FOREIGN KEY (first_nations_id)
    REFERENCES first_nations(first_nations_id)
;

ALTER TABLE project_first_nation ADD CONSTRAINT "Refproject133" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id)
;


-- 
-- TABLE: project_funding_source 
--

ALTER TABLE project_funding_source ADD CONSTRAINT "Refinvestment_action_category137" 
    FOREIGN KEY (investment_action_category_id)
    REFERENCES investment_action_category(investment_action_category_id)
;

ALTER TABLE project_funding_source ADD CONSTRAINT "Refproject138" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id)
;


-- 
-- TABLE: project_iucn_action_classification 
--

ALTER TABLE project_iucn_action_classification ADD CONSTRAINT "Refproject123" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id)
;

ALTER TABLE project_iucn_action_classification ADD CONSTRAINT "Refiucn_conservation_action_level_3_subclassification124" 
    FOREIGN KEY (iucn_conservation_action_level_3_subclassification_id)
    REFERENCES iucn_conservation_action_level_3_subclassification(iucn_conservation_action_level_3_subclassification_id)
;


-- 
-- TABLE: project_participation 
--

ALTER TABLE project_participation ADD CONSTRAINT "Refproject148" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id)
;

ALTER TABLE project_participation ADD CONSTRAINT "Refsystem_user149" 
    FOREIGN KEY (system_user_id)
    REFERENCES system_user(system_user_id)
;

ALTER TABLE project_participation ADD CONSTRAINT "Refproject_role150" 
    FOREIGN KEY (project_role_id)
    REFERENCES project_role(project_role_id)
;


-- 
-- TABLE: project_spatial_component 
--

ALTER TABLE project_spatial_component ADD CONSTRAINT "Refproject211" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id)
;

ALTER TABLE project_spatial_component ADD CONSTRAINT "Refproject_spatial_component_type212" 
    FOREIGN KEY (project_spatial_component_type_id)
    REFERENCES project_spatial_component_type(project_spatial_component_type_id)
;


-- 
-- TABLE: security 
--

ALTER TABLE security ADD CONSTRAINT "Refsecurity_rule208" 
    FOREIGN KEY (security_rule_id)
    REFERENCES security_rule(security_rule_id)
;

ALTER TABLE security ADD CONSTRAINT "Refsystem_user209" 
    FOREIGN KEY (system_user_id)
    REFERENCES system_user(system_user_id)
;

ALTER TABLE security ADD CONSTRAINT "Refproject210" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id)
;


-- 
-- TABLE: stakeholder_partnership 
--

ALTER TABLE stakeholder_partnership ADD CONSTRAINT "Refproject126" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id)
;


-- 
-- TABLE: system_user 
--

ALTER TABLE system_user ADD CONSTRAINT "Refuser_identity_source120" 
    FOREIGN KEY (user_identity_source_id)
    REFERENCES user_identity_source(user_identity_source_id)
;


-- 
-- TABLE: system_user_role 
--

ALTER TABLE system_user_role ADD CONSTRAINT "Refsystem_user139" 
    FOREIGN KEY (system_user_id)
    REFERENCES system_user(system_user_id)
;

ALTER TABLE system_user_role ADD CONSTRAINT "Refsystem_role140" 
    FOREIGN KEY (system_role_id)
    REFERENCES system_role(system_role_id)
;


-- 
-- TABLE: webform_draft 
--

ALTER TABLE webform_draft ADD CONSTRAINT "Refsystem_user141" 
    FOREIGN KEY (system_user_id)
    REFERENCES system_user(system_user_id)
;


