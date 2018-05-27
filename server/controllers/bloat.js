const configman = require('../config/config');
var jsonfile = require('jsonfile');
var fs = require('fs');

var oracledb = require('oracledb');
function release_con(connection)
{
                connection.release(
                function(err) {
                if (err) {
                  console.error(err.message);
                }
                });
}

module.exports = {
 listdb(req,res) {
    let config = configman.load();
    for(dbind in config.db) {
       config.db[dbind].pass = '';
       if(!config.db[dbind].snapshot) config.db[dbind].snapshot = 1;
    }
    res.status(200).send('{ "list": '+JSON.stringify(config.db)+' }');
 },


 deldb(req,res) {
    let config = configman.load();
    for(dbind in config.db) {
      if(config.db[dbind].name == req.body.name)
      {
        config.db.splice(dbind,1);
        break;
      }
    }
    configman.save(config);
    res.status(200).send('{ "error": false }');
 },


 adddb(req,res) {
  let config = configman.load();

  let pass;
        let configdb;
        let configdbInd = -1;
        for(dbind in config.db) {
          if(config.db[dbind].name == req.body.oldName) {
            configdb = config.db[dbind];
            configdbInd = dbind;
            break;
          }
        }

  if(configdb) pass = configdb.pass; else pass = req.body.pass;
  console.log("Try to connect to new db "+req.body.tns);
  oracledb.getConnection(
  {
    user          : req.body.user,
    password      : pass,
    connectString : req.body.tns
  },
  function(err, connection)
  {
    console.log("Connected.");
    if (err) { console.error(err); res.status(500).send('{ "error": "Cannot connect DB:'+String(err).replace(/["]/g, '')+'" }'); return; }
    connection.execute(
      "select distinct(time) from spacemon",
      function(err, result)
      {
        console.log("Check query");
        if (err) { console.error(err); res.status(500).send('{ "error": "Cannot connect DB:'+String(err).replace(/["]/g, '')+'" }'); return; }
        let newdb = { 
          name: req.body.name,
          tns: req.body.tns,
          user: req.body.user,
          pass: req.body.pass,
          snapshot: req.body.snapshot,
          keeptime: req.body.keeptime
        };

        if(req.body.oldName  == '' && configdbInd != -1) res.status(500).send('{ "error": "DB already exists with the same name" }');
        let oldSnapshot = -1;
        let oldKeeptime = -1;
        if(configdb) {
            oldSnapshot = config.db[configdbInd].snapshot;
            oldKeeptime = config.db[configdbInd].keeptime;
        }
        if(!oldKeeptime) oldKeeptime = -1;
        if(req.body.oldName == '')
          config.db.push(newdb); else
	{
          if(req.body.pass == '') newdb.pass = configdb.pass;
          config.db[configdbInd] = newdb;
          if(req.body.name != req.body.oldName)
            for(qind in config.query) {
              if(config.query[qind].dbname == req.body.oldName) {
                config.query[qind].dbname = req.body.name;
              }
            }
        }
          console.log("New Snapshot:"+req.body.snapshot+", "+"Old Snapshot:"+oldSnapshot);
          console.log("New Keeptime:"+req.body.keeptime+", "+"Old Keeptime:"+oldKeeptime);
          if((req.body.snapshot != oldSnapshot && oldSnapshot != -1) || (req.body.keeptime != oldKeeptime && oldKeeptime != -1))
          {
             if(req.body.snapshot != oldSnapshot && oldSnapshot != -1) {
               console.log("Change Interval from "+configdb.snapshot+" to "+req.body.snapshot);
               connection.execute(
                   "BEGIN set_interval(:i); END;",{i : parseInt(req.body.snapshot)},
                function(err, result)
                {
                  if (err) { console.error(err); res.status(500).send('{ "error": "Error:'+String(err).replace(/["]/g, '')+'" }'); return; }

                  config.db[configdbInd].snapshot = req.body.snapshot;
                  configman.save(config); 

                  if(req.body.keeptime != oldKeeptime && oldKeeptime != -1) {
                     console.log("Change Keeptime from "+configdb.keeptime+" to "+req.body.keeptime);
                     connection.execute(
                        "BEGIN set_keeptime(:i); END;",{i : parseInt(req.body.keeptime)},
                     function(err, result)
                     {
                         if (err) { console.error(err); res.status(500).send('{ "error": "Error:'+String(err).replace(/["]/g, '')+'" }'); return; }
                         config.db[configdbInd].keeptime = req.body.keeptime;
                         configman.save(config); 
                            connection.release(
                              function(err) {
                              if (err) {
                                console.error(err.message);
                              }
                            });
                            res.status(200).send('{ "error": false }');
                    });
                  } else {

                      connection.release(
                      function(err) {
                        if (err) {
                           console.error(err.message);
                        }
                      });
                      res.status(200).send('{ "error": false }');
                  }
                });
             } else
             {
               if(req.body.keeptime != oldKeeptime && oldKeeptime != -1) {
                     console.log("Change Keeptime from "+configdb.keeptime+" to "+req.body.keeptime);
                     connection.execute(
                        "BEGIN set_keeptime(:i); END;",{i : parseInt(req.body.keeptime)},
                     function(err, result)
                     {
                         if (err) { console.error(err); res.status(500).send('{ "error": "Error:'+String(err).replace(/["]/g, '')+'" }'); return; }
                         config.db[configdbInd].keeptime = req.body.keeptime;
                         configman.save(config); 
                            connection.release(
                              function(err) {
                              if (err) {
                                console.error(err.message);
                              }
                            });
                            res.status(200).send('{ "error": false }');
                    });
               }
             }
          } else
          {

               configman.save(config); 
               connection.release(
               function(err) {
               if (err) {
                 console.error(err.message);
               }
               });
               res.status(200).send('{ "error": false }');
          }


      });
  });     
 },

addquery(req, res) {
    let config = configman.load();
    let configquery;
    if(config.query)
    for(qind in config.query) {
      if(config.query[qind].name == req.body.qname)
      {
        configquery = config.query[qind];
        if(req.body.edit)
        {
          config.query[qind].sql = req.body.sql;
          config.query[qind].name = req.body.qnewname;
          config.query[qind].priority = req.body.priority;
          config.query[qind].update = req.body.update;
          config.query[qind].hour = req.body.hour;
          for(dind in config.dashboards) {
           for(qdind in config.dashboards[dind].queries) {
             if(config.dashboards[dind].queries[qdind].name == req.body.qname) 
             {
                config.dashboards[dind].queries[qdind].name = req.body.qnewname;
             }
           }
          }
          configman.save(config);
          res.status(200).send('{ "error": false }');
        } else
          res.status(500).send('{ "error": "Query already exist with the same name" }'); 
        return;
      }
    }
    if(!config.query) config.query = [];
    let nquery = {
      dbname : req.body.dbname,
      name : req.body.qname,
      sql : req.body.sql,
      priority: req.body.priority,
      update: req.body.update,
      hour: req.body.hour
    };
    config.query.push(nquery);
    configman.save(config);
    res.status(200).send('{ "error": false }');

 },

adddashquery(req, res) {
    let config = configman.load();
    let configdashboard;
    let dashboardInd = -1;

    if(!config.dashboards) config.dashboards = [];

    for(dind in config.dashboards) {
      if(config.dashboards[dind].name == req.body.dashboard)
      {
        dashboardInd = dind;
        configdashboard = config.dashboards[dind];
        break;
      }
    }

    if(!configdashboard) configdashboard = { name : req.body.dashboard, queries : [] };

    for(qind in configdashboard.queries) {
      if(configdashboard.queries[qind].name == req.body.name)
      {
        res.status(500).send('{ "error": "Query already on Dashboard" }'); 
        return;
      }
    }
    

    let nquery = {
      name : req.body.name,
      priority: 1
    };
    configdashboard.queries.push(nquery);

    if(dashboardInd == -1) 
    {
      config.dashboards.push(configdashboard);
    } else
    {
      config.dashboards[dashboardInd] = configdashboard;
    }
    configman.save(config);
    res.status(200).send('{ "error": false }');

 },

adddashboard(req, res) {
    let config = configman.load();
    let configdashboard;
    let dashboardInd = -1;

    if(!config.dashboards) config.dashboards = [];

    for(dind in config.dashboards) {
      if(config.dashboards[dind].name == req.body.oldName)
      {
        dashboardInd = dind;
        configdashboard = config.dashboards[dind];
        break;
      }
    }

    if(!configdashboard) configdashboard = { name : req.body.name, queries : [] }; else
     configdashboard.name = req.body.name;
    

    if(dashboardInd == -1) 
    {
      config.dashboards.push(configdashboard);
    } else
    {
      config.dashboards[dashboardInd] = configdashboard;
    }
    configman.save(config);
    res.status(200).send('{ "error": false }');

 },

deldashboard(req, res) {
    let config = configman.load();
    let configdashboard;
    let dashboardInd = -1;

    if(!config.dashboards) config.dashboards = [];

    for(dind in config.dashboards) {
      if(config.dashboards[dind].name == req.body.name)
      {
        dashboardInd = dind;
        configdashboard = config.dashboards[dind];
        config.dashboards.splice(dind,1);        
        break;
      }
    }

    if(!configdashboard) 
        res.status(500).send('{ "error": "Dashboard not found" }'); 
    

    configman.save(config);
    res.status(200).send('{ "error": false }');

 },

listqueries(req, res) {

    let config = configman.load();
    let configquery;
    squery = []
    if(config.query)
    for(qind in config.query) {
      if(config.query[qind].dbname == req.body.dbname)
      {
        config.query[qind].res = [];
        config.query[qind].lastrefresh = Date.now()+1000000;
        if( ! config.query[qind].update ) config.query[qind].update = 0;
        squery.push(config.query[qind]);
      }
    }
    
    console.log('=========================PRIORITY');
    for(qind in squery) {
      console.log(squery[qind].name+':'+squery[qind].priority);
    }
    function compare (a,b) {
      if(parseInt(a.priority) > parseInt(b.priority)) 
      {
      console.log("prio:"+a.priority+";"+b.priority+";-1");
          return -1;
      }
      if(parseInt(a.priority) < parseInt(b.priority)) 
      { 
      console.log("prio:"+a.priority+";"+b.priority+";+1");

        return  1;
      }
      console.log("prio:"+a.priority+";"+b.priority+";0");

      return 0;
    }
    squery.sort(compare);
    console.log('=========================PRIORITY');
    for(qind in squery) {
      console.log(squery[qind].name+':'+squery[qind].priority);
    }
    res.status(200).send('{ "queries": '+JSON.stringify(squery)+' }');   

},

listdashboards(req, res) {
    let config = configman.load();
    sdashboards = []

    if(!config.dashboards) config.dashboards = [];

    for(dind in config.dashboards) {
      sdashboards.push(config.dashboards[dind].name);
    }
    sdashboards.sort();
    res.status(200).send('{ "dashboards": '+JSON.stringify(sdashboards)+' }');   

},

listdashqueries(req, res) {

    let config = configman.load();
    let configdashboard;
    let configquery;
    squery = []

    if(!config.dashboards) config.dashboards = [];

    for(dind in config.dashboards) {
      if(config.dashboards[dind].name == req.body.dashboard)
      {
        dashboardInd = dind;
        console.log(dind);
        configdashboard = config.dashboards[dind];
        break;
      }
    }

    if(!configdashboard)  configdashboard = { queries : [] };

    console.log(configdashboard);

    for(qind in configdashboard.queries) {
         configdashboard.queries[qind].res = [];
         configdashboard.queries[qind].lastrefresh = Date.now()+1000000;
         squery.push(configdashboard.queries[qind]);
    }

    function compare (a,b) {
      if(parseInt(a.priority) > parseInt(b.priority)) 
      {
      console.log("prio:"+a.priority+";"+b.priority+";-1");
          return -1;
      }
      if(parseInt(a.priority) < parseInt(b.priority)) 
      { 
      console.log("prio:"+a.priority+";"+b.priority+";+1");

        return  1;
      }
      console.log("prio:"+a.priority+";"+b.priority+";0");

      return 0;
    }
    squery.sort(compare);
    res.status(200).send('{ "queries": '+JSON.stringify(squery)+' }');   

},

listfullqueries(req, res) {

    let config = configman.load();
    squery = []
    if(config.query)
    for(qind in config.query) {
        squery.push(config.query[qind].name);
    }
    
    squery.sort();
    res.status(200).send('{ "queries": '+JSON.stringify(squery)+' }');   

},

delquery(req, res) {
    let config = configman.load();
    let configquery;
    if(config.query)
    for(qind in config.query) {
      if(config.query[qind].name == req.body.name)
      {
         config.query.splice(qind,1);
         break;
      }    
    }
    configman.save(config);
    res.status(200).send('{ "errors": false }');   

},

deldashquery(req, res) {
    let config = configman.load();
    let configdashboard;
    let configquery;

    if(!config.dashboards) config.dashboards = [];

    for(dind in config.dashboards) {
      if(config.dashboards[dind].name == req.body.dashboard)
      {
        dashboardInd = dind;
        configdashboard = config.dashboards[dind];
        break;
      }
    }

    if(!configdashboard)  configdashboard = { queries : [] };

    for(qind in configdashboard.queries) {
      if(configdashboard.queries[qind].name == req.body.name)
      {
        configdashboard.queries.splice(qind,1);
        configquery = configdashboard.queries[qind];
        break;
      }
    }

    config.dashboards[dashboardInd] = configdashboard;
    configman.save(config);
    res.status(200).send('{ "errors": false }');   

},

performquery(req, res) {
    let config = configman.load();
    let configquery;
    let configdb;
    let querysql;
    if(config.query)
    for(qind in config.query) {
      if(config.query[qind].name == req.body.name)
      {
         configquery = config.query[qind];
         for(dbind in config.db) 
         {
           if(config.db[dbind].name == configquery.dbname)
           {
              configdb = config.db[dbind];
              break;  
           }
         }
         break;
      }    
    }
  if(configquery.update == 0)
  {
  oracledb.getConnection(
  {
    user          : configdb.user,
    password	  : configdb.pass,
    connectString : configdb.tns
  },
  function(err, connection)
  {
      if (err) { console.error(err); return; }
      console.log(configquery.sql);
      connection.execute(configquery.sql,
      function(err, result)
      {
       	if (err) { console.error(err); res.status(200).send('{ "name":"'+configquery.name+'","rows": [["'+err+'"]] }'); return; }
        console.log(result.rows);
        if(result.rows.length == 0) result.rows.push([["Empty"]]);

        connection.release(
        function(err) {
          if (err) {
            console.error(err.message);
          }
        });

        res.status(200).send('{ "name":"'+configquery.name+'","update":'+Date.now()+',"rows": '+JSON.stringify(result.rows)+' }');
      });
  }
  );
  } else
  {
     let cache;
     let filename = 'qcache/'+configquery.name+'.json';
     if (!fs.existsSync(filename)) {
        exists = false;
              cache = {
                 lastrefresh : Date.now(),
                 rows: [[ "Not performed yet" ]]
              };
        } else cache = jsonfile.readFileSync(filename);

     res.status(200).send('{ "name":"'+configquery.name+'","update":'+cache.lastrefresh+',"rows": '+JSON.stringify(cache.rows)+' }');
  }
}, 

 tbsplot(req, res) {
    let config = configman.load();
    let configdb;
    for(dbind in config.db) {
      if(config.db[dbind].name == req.body.name)
      {
        configdb = config.db[dbind];
        break;
      }
    }

  oracledb.getConnection(
  {
    user          : configdb.user,
    password      : configdb.pass,
    connectString : configdb.tns
  },
  function(err, connection)
  {
    if (err) { console.error(err); return; }
    connection.execute("alter session set time_zone='+03:00'",
      function(err, result)
      {
       	if (err) { console.error(err); return; }
      let sqlvars = { tbs: req.body.tbs };
      connection.execute("select to_char(time,'dd-mm-yyyy hh24:mi:ss') snap, sum(objsize) sz, (cast(time as date) - date '1970-01-01')*24*60*60  from spacemon WHERE tablespace_name = :tbs group by time order by time",sqlvars,
      function(err, result)
      {
        if (err) { console.error(err); return; }
        console.log(result.rows);
        connection.release(
        function(err) {
          if (err) {
            console.error(err.message);
          }
        });
        res.status(200).send('{ "snaps": '+JSON.stringify(result.rows)+' }');        
      });
      });
  });
 },

 listsnap(req, res) {
    let config = configman.load();
    let configdb;
    for(dbind in config.db) {
      if(config.db[dbind].name == req.body.name)
      {
        configdb = config.db[dbind];
        break;
      }
    }

  oracledb.getConnection(
  {
    user          : configdb.user,
    password      : configdb.pass,
    connectString : configdb.tns
  },
  function(err, connection)
  {
    if (err) { console.error(err); return; }
    connection.execute("alter session set time_zone='+03:00'",
      function(err, result)
      {
       	if (err) { console.error(err); return; }
      
      connection.execute("select to_char(time,'dd-mm-yyyy hh24:mi:ss') snap, sum(objsize) sz, (cast(time as date) - date '1970-01-01')*24*60*60  from spacemon group by time order by time",
      function(err, result)
      {
        if (err) { console.error(err); return; }
        console.log(result.rows);
        connection.release(
        function(err) {
          if (err) {
            console.error(err.message);
          }
        });
        res.status(200).send('{ "snaps": '+JSON.stringify(result.rows)+' }');        
      });
      });
  });
 },
 listtbs(req, res) {
    let config = configman.load();
    let configdb;
    for(dbind in config.db) {
      if(config.db[dbind].name == req.body.name)
      {
        configdb = config.db[dbind];
        break;
      }
    }

  oracledb.getConnection(
  {
    user          : configdb.user,
    password      : configdb.pass,
    connectString : configdb.tns
  },
  function(err, connection)
  {
    if (err) { console.error(err); return; }
    connection.execute("alter session set time_zone='+03:00'",
      function(err, result)
      {
       	if (err) { console.error(err); return; }
      
      connection.execute("select tablespace_name from dba_tablespaces order by tablespace_name",
      function(err, result)
      {
        if (err) { console.error(err); return; }
        console.log(result.rows);
    
        connection.release(
        function(err) {
          if (err) {
            console.error(err.message);
          }
        });

        res.status(200).send('{ "tbs": '+JSON.stringify(result.rows)+' }');        
      });
      });
  });
 },

objinfo(req, res) {
    let config = configman.load();
    let configdb;
    for(dbind in config.db) {
      if(config.db[dbind].name == req.body.dbname)
      {
        configdb = config.db[dbind];
      }
    }

  let obj = {};

  oracledb.getConnection(
  {
    user          : configdb.user,
    password      : configdb.pass,
    connectString : configdb.tns
  },
  function(err, connection)
  {
    if (err) { console.error(err); return; }
    function compare (a,b) {
      if(a.name > b.name)
          return -1;
      if(a.name < b.name)
        return  1;
      return 0;
    }

     let sqlvars = { owner: req.body.owner, name: req.body.object_name  }
    connection.execute("select o.object_type, sum(s.bytes) from dba_objects o JOIN dba_segments s ON o.object_name = s.segment_name where o.owner = :owner and o.object_name = :name and \
                           ( o.object_type = 'TABLE' or o.object_type = 'INDEX' or o.object_type = 'LOB' ) GROUP BY o.object_type",sqlvars,
      function(err, result)
      {
       	if (err) { console.error(err); res.status(500).send('{ "error": "Error:'+String(err).replace(/["]/g, '')+'" }'); return;  }
        if( result.rows.length > 1 ) {  res.status(500).send('{ "error": "More than one object returned" }'); return; }
        obj.obj_type = result.rows[0][0];
        obj.obj_size = result.rows[0][1];
        if( obj.obj_type == 'INDEX' )
        {
          connection.execute("SELECT i.owner, i.table_name, sum(s.bytes) FROM dba_indexes i LEFT JOIN dba_segments s ON i.table_name = s.segment_name WHERE i.owner = :owner and i.index_name = :name GROUP BY i.owner, i.table_name", sqlvars,
          function(err, resultind)
          {
             if (err) { console.error(err); res.status(500).send('{ "error": "Error:'+String(err).replace(/["]/g, '')+'" }'); return;  }
             console.log(resultind);
             obj.table_owner = resultind.rows[0][0];
             obj.table = resultind.rows[0][1];
             obj.table_size =  resultind.rows[0][2];
             connection.execute("select p.partition_name, sum(s.bytes) from dba_ind_partitions p JOIN dba_segments s ON p.partition_name = s.partition_name AND :name = s.segment_name  where p.index_owner = :owner and p.index_name = :name GROUP BY p.partition_name",sqlvars,
             function(err, resultpart) {
             if (err) { console.error(err); res.status(500).send('{ "error": "Error:'+String(err).replace(/["]/g, '')+'" }'); return;  }
               obj.partitions = [];
               for(pind in resultpart.rows)
                 obj.partitions.push( { name: resultpart.rows[pind][0], size: resultpart.rows[pind][1] });
               obj.partitions.sort(compare);
               release_con(connection);
               res.status(200).send('{ "info": '+JSON.stringify(obj)+' }');
             });
          });
        } else
        if( obj.obj_type == 'TABLE' )
        {
          connection.execute("select p.partition_name, sum(s.bytes) from dba_tab_partitions p JOIN dba_segments s ON p.partition_name = s.partition_name AND :name = s.segment_name where p.table_owner = :owner and p.table_name = :name GROUP BY p.partition_name",sqlvars,
             function(err, resultpart) {
             if (err) { console.error(err); res.status(500).send('{ "error": "Error:'+String(err).replace(/["]/g, '')+'" }'); return;  }
               obj.partitions = [];
               for(pind in resultpart.rows)
                 obj.partitions.push( { name: resultpart.rows[pind][0], size: resultpart.rows[pind][1] });
               obj.partitions.sort(compare);
               release_con(connection);
               res.status(200).send('{ "info": '+JSON.stringify(obj)+' }');
             });
        } else
        if( obj.obj_type == 'LOB' )
        {
          let sqlvars = { name: req.body.object_name  }
          connection.execute("SELECT l.owner, l.table_name, sum(bytes) FROM dba_lobs l JOIN dba_segments s ON l.table_name = s.segment_name WHERE l.segment_name = :name GROUP BY l.owner, l.table_name", sqlvars,
          function(err, resultlob)
          {
             if (err) { console.error(err); res.status(500).send('{ "error": "Error:'+String(err).replace(/["]/g, '')+'" }'); return;  }
             console.log(resultlob);
             obj.table_owner = resultlob.rows[0][0];
             obj.table = resultlob.rows[0][1];
             obj.table_size = resultlob.rows[0][2];
             connection.execute("select p.lob_partition_name, p.partition_name, sum(bytes) from dba_lob_partitions p JOIN dba_segments s ON p.lob_partition_name = s.partition_name AND :name = s.segment_name WHERE  p.lob_name = :name GROUP BY p.partition_name, p.lob_partition_name",sqlvars,
             function(err, resultpart) {
             if (err) { console.error(err); res.status(500).send('{ "error": "Error:'+String(err).replace(/["]/g, '')+'" }'); return;  }
               obj.partitions = [];
               for(pind in resultpart.rows)
                 obj.partitions.push( { name: resultpart.rows[pind][1], lobname: resultpart.rows[pind][0], size: resultpart.rows[pind][2] });
               obj.partitions.sort(compare);
               release_con(connection);
               res.status(200).send('{ "info": '+JSON.stringify(obj)+' }');
             });
          });
        } else
        {
          release_con(connection);
          res.status(200).send('{ "info": '+JSON.stringify(obj)+' }');        
        }
      });
  });

}, 


 snapreport(req, res) {
    let config = configman.load();
    let configdb;
    for(dbind in config.db) {
      if(config.db[dbind].name == req.body.name)
      {
        configdb = config.db[dbind];
        break;
      }
    }

  oracledb.getConnection(
  {
    user          : configdb.user,
    password      : configdb.pass,
    connectString : configdb.tns
  },
  function(err, connection)
  {
    if (err) { console.error(err); return; }
    connection.execute("alter session set time_zone='+03:00'",
      function(err, result)
      {
       	if (err) { console.error(err); return; }
        
        let tbsfilter = ''
        let sqlvars = { first: req.body.first, second: req.body.second  }
        if(req.body.tbs != 'ALL') 
        {
            tbsfilter = ' AND s1.tablespace_name = :tbs ' ;
            sqlvars = { first: req.body.first, second: req.body.second, tbs: req.body.tbs  }
        }
      connection.execute("select * from ( select s1.tablespace_name, s1.owner, s1.segment_name, s1.partition_name,  s2.objsize-s1.objsize diff, s1.objsize s1size, s2.objsize s2size  from spacemon s1 JOIN spacemon s2 ON s1.owner = s2.owner and s1.segment_name = s2.segment_name and s1.partition_name = s2.partition_name where s1.time = to_date(:first,'dd-mm-yyyy hh24:mi:ss') and s2.time = to_date(:second,'dd-mm-yyyy hh24:mi:ss') "+tbsfilter+" and not  s1.tablespace_name like 'UNDO%'  order by s2.objsize-s1.objsize desc) d where rownum < 30",sqlvars,
      function(err, result)
      {
        if (err) { console.error(err); return; }
           console.log(result.rows);
           var rows = result.rows;
           //new objects
           connection.execute("select s1.tablespace_name, s1.owner, s1.segment_name, s1.partition_name, s1.objsize, 0, s1.objsize from spacemon s1 where s1.time = to_date (:second, 'dd-mm-yyyy hh24:mi:ss') and (select count(*) from spacemon s2 where s2.owner=s1.owner and s2.segment_name=s1.segment_name and s2.partition_name=s1.partition_name and s2.time = to_date (:first, 'dd-mm-yyyy hh24:mi:ss')) = 0 order by s1.objsize desc",sqlvars,
           function(err, result)
           {
             if (err) { console.error(err); return; }
             var rowsall = rows.concat(result.rows);
             function compare (a,b) {
               if(parseInt(a[4]) > parseInt(b[4]))
                  return -1;
               if(parseInt(a[4]) < parseInt(b[4]))
                  return  1;
               return 0;
             }
             rowsall.sort(compare);
             var rowsres = rowsall.slice(0,30);
             release_con(connection);
            res.status(200).send('{ "rows": '+JSON.stringify(rowsres)+' }');        
           });
        });
      });
  });
 },

 delsnap(req, res) {
    let config = configman.load();
    let configdb;
    for(dbind in config.db) {
      if(config.db[dbind].name == req.body.name)
      {
        configdb = config.db[dbind];
        break;
      }
    }

  oracledb.getConnection(
  {
    user          : configdb.user,
    password      : configdb.pass,
    connectString : configdb.tns
  },
  function(err, connection)
  {
    if (err) { console.error(err); return; }
    connection.execute("alter session set time_zone='+03:00'",
      function(err, result)
      {
       	if (err) { console.error(err); return; }
        
        let sqlvars = { time: req.body.time  }
      connection.execute("delete from spacemon where time = to_date(:time,'dd-mm-yyyy hh24:mi:ss')",sqlvars,{ autoCommit: true },
      function(err, result)
      {
        if (err) { console.error(err); return; }
        console.log(result.rows);
        connection.release(
        function(err) {
          if (err) {
            console.error(err.message);
          }
        });

        res.status(200).send('{ "error": false }');        
      });
      });
  });
 }

};
