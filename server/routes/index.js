const bloatController = require('../controllers/bloat');
const morgan = require('morgan');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

module.exports = (app) => {

  app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.get('/api/hello', (req, res) => res.status(200).send('{ "response": "Hello" }'));


  app.get('/api/listdb', bloatController.listdb);

  app.post('/api/adddb', bloatController.adddb);
  app.post('/api/deldb', bloatController.deldb);

  app.post('/api/addquery', bloatController.addquery);
  app.post('/api/delquery', bloatController.delquery);

  app.post('/api/adddashboard', bloatController.adddashboard);
  app.post('/api/deldashboard', bloatController.deldashboard);

  app.post('/api/adddashquery', bloatController.adddashquery);
  app.post('/api/deldashquery', bloatController.deldashquery);

  app.post('/api/listdashqueries', bloatController.listdashqueries);
  app.get('/api/listdashboards', bloatController.listdashboards);

  app.post('/api/listqueries', bloatController.listqueries);
  app.post('/api/performquery', bloatController.performquery);

  app.get('/api/listfullqueries', bloatController.listfullqueries);


  app.post('/api/listsnap', bloatController.listsnap);
  app.post('/api/delsnap', bloatController.delsnap);
  app.post('/api/snapreport', bloatController.snapreport);
  app.post('/api/listtbs', bloatController.listtbs);

  app.post('/api/objinfo', bloatController.objinfo);

  app.use(express.static(path.resolve(__dirname, '../..', 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../..', 'dist', 'index.html'));
  });
};
