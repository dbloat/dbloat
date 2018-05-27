var jsonfile = require('jsonfile');
var fs = require('fs');
const configman = require('../config/config');
var schedule = require('node-schedule');
var oracledb = require('oracledb');

module.exports = {
 runJobs() {
    var j = schedule.scheduleJob('* * * * *', async function() {
      if(global.reporterLock) 
      {
         console.log("Reporter still running:"+global.currentReport);
         return;
      }
      global.reporterLock = true;
      
      
      let config = configman.load();
      let configquery;
      let configdb;
      squery = []
      if(config.query)
      for(qind in config.query) {
        if(config.query[qind].update > 0)
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
           let datenow = Date.now();
           let cache;
           let exists = true;
           let filename = 'qcache/'+configquery.name+'.json';
           if (!fs.existsSync(filename)) {
              exists = false;
              cache = {
                 lastrefresh : datenow
              };
           } else cache = jsonfile.readFileSync(filename);

           global.currentReport = configquery.name;
           let curhour = new Date().getHours();
           console.log(configquery.name+" - hour:"+configquery.hour+", now:"+curhour+", refresh:"+(configquery.update*60*1000)+", now:"+(datenow - cache.lastrefresh));
           if(((datenow - cache.lastrefresh > configquery.update*60*1000) && (curhour >= configquery.hour))|| !exists)
           {
               let connected = true;
               console.log(config.query[qind].name);
               try {
                  connection = await oracledb.getConnection(
                  {
                     user          : configdb.user,
                     password      : configdb.pass,
                     connectString : configdb.tns
                  });
               } catch (err) {
                  if (err) { console.error(err); connected = false; }
               }
               if(connected) {
                   try {
                     console.log(configquery.sql);
                     result = await connection.execute(configquery.sql);
                     console.log(result.rows);
                     cache.lastrefresh = Date.now();
                     cache.rows = result.rows;
                     if(result.rows.length == 0) result.rows.push(["Empty"]);
                     jsonfile.writeFileSync(filename, cache);

                     connection.release(
                       function(err) {
                         if (err) {
                           console.error(err.message);
                         }
                     });

                  } catch(err) {
                      if (err) { console.error(err); cache.rows = [["'+err+'"]]; }
                  }
              }
           }
        }
      }
      console.log('============== End job');
      global.reporterLock = false;
    });
 }
};
