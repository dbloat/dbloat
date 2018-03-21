import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { FlatButton, RaisedButton, Dialog, DialogActions, DialogTitle} from "material-ui";
import TextField from "material-ui/TextField";
import DBIcon from 'material-ui/svg-icons/places/kitchen';
import CancelIcon from 'material-ui-icons/Cancel';
import OKIcon from 'material-ui-icons/Done';
import { red500 } from 'material-ui/styles/colors.js'

const api = require('./api');

class Auth extends Component {

 
  constructor() {
    super();
    this.state = {
      response: '',
      error: '',
      user: '',
      pass: ''
    };
  }

  componentDidMount() {
  }





  checkAuth = () => {
    console.log(this.state.user+";"+this.state.pass);
    let auth = api.createAuth(this.state.user, this.state.pass);
    api.callApiFirst('/api/listdb', auth)
      .then((res) => {
	 console.log(res);         
         localStorage.setItem('auth',auth);
         this.props.history.push('/'); 
       })
      .catch((err) => { console.log(err); this.setState({error: String(err)}); });
  }


  handleClose = () => {
     this.checkAuth();
  }



  render() {

  const style = {
    textAlign: 'left',
    width : '90%',
    display: 'inline-block',
    padding: '10px'
  };


    return (
      <MuiThemeProvider>
      <div className="App">
        <Paper label="Report" style={style} >
        <TextField onChange={(e, value) => { this.setState({ user: value } ); }} hintText="Login" />
        <TextField onChange={(e, value) => { this.setState({ pass: value } ); }} hintText="Password" type="password" />
        <div>
        <RaisedButton         
        label="Login"
        primary={true}
        onClick={this.handleClose}
        />
        </div>
        </Paper>
      </div>
      </MuiThemeProvider>
    );
  }
}

export default Auth;

