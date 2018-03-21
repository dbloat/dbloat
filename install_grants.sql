create user :username identified by :password DEFAULT TABLESPACE USERS ;
grant create session to :username;
grant select on dba_segments to :username;
grant select on dba_tablespaces to :username;
grant create table to :username;
grant create procedure to :username;
alter user :username quota unlimited on users;

