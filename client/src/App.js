import React, { Component } from 'react';
import List, {
  
  ListItem,
  makeSelectable
} from 'material-ui/List';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { FlatButton, RaisedButton, Dialog, DialogActions, DialogTitle} from "material-ui";
import TextField from "material-ui/TextField";
import DBIcon from 'material-ui/svg-icons/places/kitchen';
import DeleteIcon from 'material-ui-icons/Delete';
import SettingsIcon from 'material-ui-icons/Settings';
import IconButton from 'material-ui/IconButton';
import { red500 } from 'material-ui/styles/colors.js'
import { gray500 } from 'material-ui/styles/colors.js'

const api = require('./api');

class App extends Component {

 
  constructor() {
    super();
    this.state = {
      response: '',
      addDBDialog: false,      
      addDBTitle: '',
      deleteDBDialog: false,
      error: '',
      dblist: [],
      editDB: ''      
    };
  }

  componentDidMount() {
    this.updateDBList();    
  }

  handleOpen = () =>  {
    this.setState({addDBDialog: true, addDBTitle: 'Add Database', newDBName: '', newDBTNS: '', newDBUser: '', newDBPass: '', editDB: '', newSnapshotInterval : 1 });
  };

  handleLoad = (db) =>  {
    this.setState({addDBDialog: true, addDBTitle: 'Database Settings', newDBName: db.name, newDBTNS: db.tns, newDBUser: db.user, newDBPass: '', editDB: db.name, newSnapshotInterval : db.snapshot});
  };

  handleClose = () =>  {
    this.setState({addDBDialog: false});
  };

  handleDeleteClose = () =>  {
    this.setState({deleteDBDialog: false});   
  };

  addDatabase = () =>  {
    var data = {
      name: this.state.newDBName,
      tns: this.state.newDBTNS,
      user: this.state.newDBUser,
      pass: this.state.newDBPass,
      oldName: this.state.editDB,
      snapshot: this.state.newSnapshotInterval
    };
    api.callPostApi('/api/adddb', data)
      .then((res) => { 
         this.handleClose();
         this.updateDBList();
       })
      .catch((err) => { console.log(err); this.setState({error: String(err)}); });
  };

  deleteDatabase = () =>  {
    var data = {
      name: this.state.deleteDB,
    };
    api.callPostApi('/api/deldb', data)
      .then((res) => { 
         this.handleDeleteClose();
         this.updateDBList();
       })
      .catch((err) => { console.log(err); this.setState({error: String(err)}); });
  };

  updateDBList = () => {
    api.callApi('/api/listdb')
      .then((res) => {
	 console.log(res);         
         this.setState({dblist: res.list});
       })
      .catch((err) => { 
           console.log(err); 
           this.setState({error: String(err)}); 
           if ( err == "Error: Not Authorized") 
	    this.props.history.push('/auth');             
      });
  }

  handleDashboards = () => {
	    this.props.history.push('/dashboard');             
  }

  handleDBClick = (n) => {
    console.log(n);
    this.props.history.push('/db/'+n);
  }

  _buildDBList = (el) => {
            var actions =              
            (
                <div>
                <IconButton
                    tooltip='Settings'
                    onClick={(e) => { e.stopPropagation(); this.handleLoad(el); } }
                >
                    <SettingsIcon color={gray500} /> 
                </IconButton>
                <IconButton
                    tooltip='Delete'
                    onClick={(e) => { e.stopPropagation(); this.setState({ deleteDB: el.name, deleteDBDialog: true }); } }
                >
                    <DeleteIcon color={red500} /> 
                </IconButton>
                </div>
            );            
           
       return           <ListItem  key={el.name} leftIcon={<DBIcon />} primaryText={el.name} rightIconButton={actions} onClick={() => { this.handleDBClick(el.name); }}  />      
  }

  render() {
    let SelectableList = makeSelectable(List);
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleClose}
      />,
      <FlatButton
        label="Add"
        primary={true}
        keyboardFocused={true}
        onClick={this.addDatabase}
      />,
    ];

    const deleteActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleDeleteClose}
      />,
      <FlatButton
        label="Delete"
        primary={true}
        keyboardFocused={true}
        onClick={this.deleteDatabase}
      />,
    ];


    return (
      <MuiThemeProvider>
      <div className="App">
        <RaisedButton label="Add Database" backgroundColor="#a4c639" onClick={this.handleOpen}/>
        <RaisedButton style={{ marginLeft : "20px" }} label="Dashboards" backgroundColor="#a4c639" onClick={this.handleDashboards}/>
        <List>
         {this.state.dblist.map(this._buildDBList)}
        </List>
        <Dialog
          title="Delete Database"
          actions={deleteActions}
          modal={false}
          open={this.state.deleteDBDialog}
          onRequestClose={this.handleDeleteClose}
          autoDetectWindowHeight={true}
        >
        <p>Are you sure to delete DB {this.state.deleteDB} ?</p>
        </Dialog>

        <Dialog
          title={this.state.addDBTitle}
          actions={actions}
          modal={false}
          open={this.state.addDBDialog}
          onRequestClose={this.handleClose}
          autoDetectWindowHeight={true}
        >
        <p> {this.state.error}</p> 
        <TextField onChange={(e, value) => { this.setState({ newDBName: value } ); }} hintText="Enter Database name" floatingLabelText="DB Name" value={this.state.newDBName} />
        <TextField onChange={(e, value) => { this.setState({ newDBTNS: value } ); }} hintText="Enter Oracle TNS" floatingLabelText="Oracle TNS" fullWidth={true} value={this.state.newDBTNS} />
        <TextField onChange={(e, value) => { this.setState({ newDBUser: value } ); }} hintText="Enter username for connection" floatingLabelText="Username" value={this.state.newDBUser} />
        <TextField onChange={(e, value) => { this.setState({ newDBPass: value } ); }} hintText="Enter password" type="password" floatingLabelText="Password" value={this.state.newDBPass} />
        {this.state.editDB != '' && 
           <TextField onChange={(e, value) => { this.setState({ newSnapshotInterval: value } ); }} hintText="Enter interval" floatingLabelText="Snapshot Interval (hours)"  value={this.state.newSnapshotInterval} />
        }
        </Dialog>
      </div>
      </MuiThemeProvider>
    );
  }
}

export default App;

