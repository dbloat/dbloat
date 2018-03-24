import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import React from 'react';

import App from './App';
import DB from './DB';
import Report from './Report';
import Auth from './Auth';
import Dashboard from './Dashboard';
import DBObject from './DBObject';

const Routes = (props) => (
  <Router>
  <div>
  <Link to="/"><h2><img src="/img/pallokala.jpg" ></img><div id="headertext">DBloat</div></h2></Link>{' '}
  <Switch>
    <Route path="/" exact component={App} />    
    <Route path="/db/*" component={DB} />    
    <Route path="/report/*" component={Report} />    
    <Route path="/auth" component={Auth} />    
    <Route path="/dashboard" component={Dashboard} />    
    <Route path="/dbobject" component={DBObject} />    
  </Switch>
  </div>
  </Router>
);

export default Routes;
