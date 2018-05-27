create table spacemon (time timestamp, tablespace_name varchar(128), owner varchar(128), segment_name varchar(128), partition_name varchar(128), objsize INTEGER);
alter table spacemon add primary key (time,  owner, segment_name, partition_name, tablespace_name);

create or replace procedure space_snapshot
is
begin
insert into spacemon select sysdate, tablespace_name, owner, segment_name, NVL(partition_name,'-'), sum(bytes) objsize from dba_segments
  group by tablespace_name, owner, segment_name, partition_name;
commit;
end;
/

create or replace procedure set_interval ( interval IN INT )
is
  jobnum INT;
begin
  select job into jobnum from user_jobs where what like 'space_snapshot%';
  dbms_job.change(jobnum,null,sysdate+5/60/24,'sysdate+' || to_char(interval) || '/24');
commit;
end;
/


declare
        l_job number;
BEGIN
DBMS_JOB.SUBMIT(l_job, 'space_snapshot;', sysdate, 'sysdate+1/24');
COMMIT;
END;
/

create or replace procedure clean_snapshot ( interval IN INT)
is
begin
delete from spacemon where time < SYSDATE - interval;
commit;
end;
/

declare
        l_job number;
BEGIN
DBMS_JOB.SUBMIT(l_job, 'clean_snapshot(60);', sysdate, 'sysdate+1');
COMMIT;
END;
/

create or replace procedure set_keeptime ( interval IN INT )
is
  jobnum INT;
begin
  select job into jobnum from user_jobs where what like 'clean_snapshot%';
  dbms_job.change(jobnum,'clean_snapshot('||interval||');',sysdate,'sysdate+1');
commit;
end;
/
