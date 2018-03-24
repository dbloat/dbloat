prompt Enter username: &&username
prompt Enter password: &&password
create user &username identified by "&password" DEFAULT TABLESPACE USERS ;
grant create session to &username;
grant select on dba_segments to &username;
grant select on dba_tablespaces to &username;
grant select on dba_objects to &username;
grant select on dba_indexes to &username;
grant select on dba_ind_partitions to &username;
grant select on dba_tables to &username;
grant select on dba_tab_partitions to &username;
grant select on dba_lobs to &username;
grant select on dba_lob_partitions to &username;
grant create table to &username;
grant create procedure to &username;
alter user &username quota unlimited on users;


