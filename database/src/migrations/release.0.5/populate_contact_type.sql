-- populate_contact_type.sql
insert into contact_type (name, record_effective_date) values ('Coordinator', now());
insert into contact_type (name, record_effective_date) values ('Participant', now());