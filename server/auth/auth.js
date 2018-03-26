var jsonfile = require('jsonfile');
var fs = require('fs');
var file = 'auth.json';
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

module.exports = {
 checkUser(req, res) {
    if (!fs.existsSync(file)) {
       res.status(500).send('{ "error": "Auth configuration not found on server" }'); 
       return;
    }
    let auth = jsonfile.readFileSync(file);
    if (auth.method == 'json' )
    {
      for(let userind in auth.users) {
         console.log(auth.users[userind].user+";"+auth.users[userind].pass);
         if(auth.users[userind].user == req.body.user)
           if( bcrypt.compareSync(req.body.pass, auth.users[userind].pass) ) {
             let token = jwt.sign({ user: auth.users[userind].user }, auth.secret, { expiresIn: 86400 });
             res.status(200).send('{ "token": "'+token+'" }');
         }
      }
      res.status(401).send('{ "error": "Bad authentication credentials" }'); 
    } else
    {
       res.status(500).send('{ "error": "Unknown authentication method enabled on server" }'); 
       return;
    }
 },
 checkToken(req, res, next) {
   if (!fs.existsSync(file)) {
       res.status(500).send('{ "error": "Auth configuration not found on server" }'); 
       return;
   }
   let auth = jsonfile.readFileSync(file);
   let header = req.get("Authorization");
   if(header == undefined) {
     res.status(401).send('{ "error": "Not Authorized1" }');
     return;
   }
   let headeropts = header.split(' ');
   if(headeropts.length != 2)
   {
       res.status(401).send('{ "error": "Not Authorized2" }');
       return;
   }
   if(headeropts[0] != 'Bearer')
   {
       res.status(401).send('{ "error": "Not Authorized3" }');
       return;
   }
   let token = headeropts[1];
   console.log(token);
   jwt.verify(token, auth.secret, function(err, decoded) {
     if(err) { res.status(401).send('{ "error": "Not Authorized4" }'); return; }
     next();
   });
 }
};
