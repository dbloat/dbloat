var jsonfile = require('jsonfile');
var fs = require('fs');
var file = 'config.json';

module.exports = {
 load() {
    if (!fs.existsSync(file)) {
      //make base config
      var config = {
        db : []        
      };
      jsonfile.writeFileSync(file, config);
    }
    return jsonfile.readFileSync(file);
 }, 
 save(config)
 {
   jsonfile.writeFileSync(file, config);
 }
};
