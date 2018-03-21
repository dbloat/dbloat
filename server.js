// This will be our application entry. We'll setup our server here.
const http = require('http');
const app = require('./app');  // The express app we just created
const job = require('./server/jobs/reporter');

job.runJobs();

const port = parseInt(process.env.PORT, 10) || 8060;
app.set('port', port);

const server = http.createServer(app);
server.listen(port);

