const bcrypt = require('bcrypt');
console.log(process.argv[2]);
if ( process.argv[2] == undefined)
{
  console.log("Usage: node hash.js <password>");
} else
{
let hash = bcrypt.hashSync(process.argv[2],8);
console.log(hash);
}
