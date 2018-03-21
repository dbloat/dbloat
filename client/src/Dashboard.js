import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import LinearProgress from 'material-ui/LinearProgress';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { FlatButton, RaisedButton, Dialog, DialogActions, DialogTitle} from "material-ui";
import IconButton from 'material-ui/IconButton';
import TextField from "material-ui/TextField";
import DBIcon from 'material-ui/svg-icons/places/kitchen';
import CancelIcon from 'material-ui-icons/Cancel';
import OKIcon from 'material-ui-icons/Done';
import { red500 } from 'material-ui/styles/colors.js'
import { gray500 } from 'material-ui/styles/colors.js'
import DeleteIcon from 'material-ui-icons/Delete';
import RefreshIcon from 'material-ui-icons/Refresh';
import TimeAgo from 'react-timeago';


const api = require('./api');


class App extends Component {

 
  constructor() {
    super();
    this.state = {
      response: '',
      error: '',
      dashboardlist: ["Default"],
      querylist: [],
      fullquerylist: [],
      dashboard: "Default",
      addQueryDialog: false,
      deleteQueryDialog: false,
      addDashboardDialog : false,
      addDashboardTitle: "Add",
      deleteDashboardDialog: false
    };
  }

  componentDidMount() {
    this.updateDashboards();
    this.updateQueries(this.state.dashboard);    
  }


  handleReport = () =>  {
  };

  handleCancel = () =>  {
  };

  updateQueries = (currentDashboard) => {
    var data = {
      dashboard: currentDashboard,
    };
    api.callPostApi('/api/listdashqueries', data)
      .then((res) => {
         this.setState({querylist: res.queries});
         for(var i in res.queries) {
           this.performQuery(res.queries[i]);
         }
     })
      .catch((err) => {
           console.log(err);
           this.setState({error: String(err)});
           if ( err == "Error: Not Authorized")
            this.props.history.push('/auth');

       });

  };

  updateFullQueries = () => {
    api.callApi('/api/listfullqueries')
      .then((res) => {
         this.setState({fullquerylist: res.queries});
     })
      .catch((err) => {
           console.log(err);
           this.setState({error: String(err)});
           if ( err == "Error: Not Authorized")
            this.props.history.push('/auth');

       });

  };

  updateDashboards = () => {
    api.callApi('/api/listdashboards')
      .then((res) => {
         this.setState({dashboardlist: res.dashboards});
         if(this.state.dashboard == "Default") {
           this.setState({ dashboard : res.dashboards[0] });
           this.updateQueries(res.dashboards[0]);
         }
     })
      .catch((err) => {
           console.log(err);
           this.setState({error: String(err)});
           if ( err == "Error: Not Authorized")
            this.props.history.push('/auth');

       });

  };

  performQuery = (query) => {
    var data = {
      name: query.name,
    };
    api.callPostApi('/api/performquery', data)
      .then((res) => {
         let querylist = this.state.querylist;
         for (var i in querylist) {
           if (querylist[i].name == res.name)
           {
             querylist[i].res = res.rows;             
             querylist[i].lastrefresh = res.update;
           }
         }
         this.setState({querylist: querylist});
     })
      .catch((err) => {
           console.log(err);
           this.setState({error: String(err)});
           if ( err == "Error: Not Authorized")
            this.props.history.push('/auth');

       });

  };

  addQuery = () =>  {
    var data;
    data = {
      dashboard : this.state.dashboard,
      name: this.state.currentQuery
    }; 

    api.callPostApi('/api/adddashquery', data)
      .then((res) => {
         this.handleClose();
         this.updateQueries(this.state.dashboard);
       })
      .catch((err) => { console.log(err); this.setState({error: String(err)}); });
  };

  addRenameDashboard = () =>  {
    var data;
    data = {
      name: this.state.newDashboardName,
      oldName: this.state.oldDashboardName
    }; 

    api.callPostApi('/api/adddashboard', data)
      .then((res) => {
         this.handleDashboardClose();
         this.updateDashboards();
         this.setState({ dashboard : this.state.newDashboardName });
         this.updateQueries(this.state.newDashboardName);
       })
      .catch((err) => { console.log(err); this.setState({error: String(err)}); });
  };

  deleteQuery = () =>  {
    var data;
    data = {
      dashboard : this.state.dashboard,
      name: this.state.deleteQuery
    };

    api.callPostApi('/api/deldashquery', data)
      .then((res) => {
         this.handleDeleteClose();
         this.updateQueries(this.state.dashboard);
       })
      .catch((err) => { console.log(err); this.setState({error: String(err)}); });
  };

  deleteDashboard = () =>  {
    var data;
    data = {
      name : this.state.dashboard,
    };

    api.callPostApi('/api/deldashboard', data)
      .then((res) => {
         this.handleDashboardDeleteClose();
         this.updateDashboards();
         this.setState({ dashboard : this.state.dashboardlist[0] });
         this.updateQueries(this.state.dashboardlist[0]);
       })
      .catch((err) => { console.log(err); this.setState({error: String(err)}); });
  };




  handleDashboardChange = (event, index, value) => { 
      this.setState({dashboard : value});
      this.updateQueries(value);
  }

  handleSnapClick = (n) => {
  }


  _buildDropDownMenu = (el) => {
     return <MenuItem className="dashboardMenu" value={el} primaryText={el} />
  }

  _buildResTableColumn = (el) => {
       return <TableRowColumn style={{ padding:0, height: "18px", wordWrap: "break-word", whiteSpace: "normal" }} >{el}</TableRowColumn>
  }

  _buildResTableRow = (el) => {
       return           <TableRow style={{ padding:0, height: "18px" }} >{el.map(this._buildResTableColumn)}</TableRow>
  }

  _buildResTableColumn = (el) => {
       return <TableRowColumn style={{ padding:0, height: "18px", wordWrap: "break-word", whiteSpace: "normal" }} >{el}</TableRowColumn>
  }

  _buildResTableRow = (el) => {
       return           <TableRow style={{ padding:0, height: "18px" }} >{el.map(this._buildResTableColumn)}</TableRow>
  }


  agoFormatter = (value, units, suffix, date, defaultFormatter) => {
     let newValue = value;
     if(date > Date.now()) return "Refreshing...";
     if(units == 'second') 
     {
       if(newValue < 30) return "few seconds ago";
       if(newValue >= 30) return "30 seconds ago";       
     }
     return defaultFormatter(newValue, units, suffix, date, defaultFormatter);
  }

  _buildQueryList = (el) => {


       return      (
            <Card key={el.name} style={{ width : "90%", margin: "20px" }}  >
           <CardHeader title={el.name} style={{ backgroundColor: "#80CBC4"}}  >        
		<TimeAgo style={{ fontSize: "9pt", float: "right", position: "relative", bottom: "15px" }}date={el.lastrefresh} formatter={this.agoFormatter} /> 
	  </CardHeader>

     
    <CardActions>
       <IconButton
            tooltip='Remove from Dashboard'
                     onClick={(e) => { e.stopPropagation(); this.setState({ deleteQuery: el.name, deleteQueryDialog: true }); } }
            style={{ width: "20px", padding: "0px" }}
        >
                    <DeleteIcon color={gray500} />
       </IconButton>
       <IconButton
            tooltip='Refresh'
            onClick={(e) => { e.stopPropagation(); this.performQuery(el);  } }
            style={{ width: "20px",  padding: "0px", marginRight: "12px" }}
        >
                    <RefreshIcon color={gray500} />
       </IconButton>
    </CardActions>
        <CardText >
        <Table className="queryTable" >
         <TableBody displayRowCheckbox={false} >
         {el.res.map(this._buildResTableRow)}
         </TableBody>
        </Table>


           </CardText>
            </Card>
       );
  }


  handleDashboardAddOpen = () =>  {
    this.setState({addDashboardDialog: true, newDashboardName : '', oldDashboardName: '', addDashboardTitle: 'New Dashboard', editDashboard: true });
  };

  handleDashboardRenameOpen = () =>  {
    this.setState({addDashboardDialog: true,  newDashboardName: this.state.dashboard, oldDashboardName: this.state.dashboard, addDashboardTitle: 'Rename Dashboard',  editDashboard: true });
  };

  handleDashboardDeleteOpen = (name) =>  {
    this.setState({deleteDashboardDialog: true });
  };

  handleDashboardClose = () =>  {
    this.setState({addDashboardDialog: false});
  };

  handleDashboardDeleteClose = () =>  {
    this.setState({deleteDashboardDialog: false});
  };

  handleOpen = () =>  {
    this.updateFullQueries();
    this.setState({addQueryDialog: true });
  };


  handleClose = () =>  {
    this.setState({addQueryDialog: false});
  };

  handleDeleteClose = () =>  {
    this.setState({deleteQueryDialog: false});
  };


  render = () => {

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
        onClick={this.addQuery}
      />,
    ];

   const dashActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleDashboardClose}
      />,
      <FlatButton
        label="OK"
        primary={true}
        keyboardFocused={true}
        onClick={this.addRenameDashboard}
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
        onClick={this.deleteQuery}
      />,
    ];

    const deleteDashActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleDashboardDeleteClose}
      />,
      <FlatButton
        label="Delete"
        primary={true}
        keyboardFocused={true}
        onClick={this.deleteDashboard}
      />,
    ];


  const style = {
    textAlign: 'left',
    width : '90%',
    display: 'inline-block',
    padding: '10px'
  };


    return (
      <MuiThemeProvider>
      <div className="App">
        <Paper label="Dashboard" style={style} >
        <h2>Dashboard - {this.state.dashboard}</h2>
        <div style={{ padding: "10px" }} >
          <DropDownMenu className="dashboardMenu"  value={this.state.dashboard} onChange={(event, index, value) => { this.setState({ dashboard : value });  this.updateQueries(value); }} >
            {this.state.dashboardlist.map(this._buildDropDownMenu)}
        </DropDownMenu>
        <RaisedButton style={{ marginLeft: "15px" }} label="Add" backgroundColor="#a4c639" onClick={this.handleDashboardAddOpen}/>
        <RaisedButton style={{ marginLeft: "15px" }} label="Rename" backgroundColor="#a4c639" onClick={this.handleDashboardRenameOpen}/>
        <RaisedButton style={{ marginLeft: "15px" }} label="Delete" backgroundColor="#a4c639" onClick={this.handleDashboardDeleteOpen}/>
        </div> 
        <RaisedButton label="Add Query" backgroundColor="#EC407A" onClick={this.handleOpen}/>

         {this.state.querylist.map(this._buildQueryList)}
        </Paper>
        <Dialog
          title="Add Query"
          actions={actions}
          modal={false}
          open={this.state.addQueryDialog}
          onRequestClose={this.handleClose}
          autoDetectWindowHeight={true}
        >
        <p> {this.state.error} </p>
        <DropDownMenu value={this.state.currentQuery} onChange={(event, index, value) => { this.setState({ currentQuery : value }); }} >
            {this.state.fullquerylist.map(this._buildDropDownMenu)}
        </DropDownMenu>

        </Dialog>
        <Dialog
          title="Delete Query"
          actions={deleteActions}
          modal={false}
          open={this.state.deleteQueryDialog}
          onRequestClose={this.handleDeleteClose}
          autoDetectWindowHeight={true}
        >
        <p>Are you sure to delete Query {this.state.deleteQuery} ?</p>
        </Dialog>

        <Dialog
          title={this.state.addDashboardTitle}
          actions={dashActions}
          modal={false}
          open={this.state.addDashboardDialog}
          onRequestClose={this.handleDashboardClose}
          autoDetectWindowHeight={true}
        >
        <p> {this.state.error} </p>
        <TextField onChange={(e, value) => { this.setState({ newDashboardName: value } );  }} 
		hintText="Enter Dashboard name" 
		value={this.state.newDashboardName} />
        </Dialog>

        <Dialog
          title="Delete Dashboard"
          actions={deleteDashActions}
          modal={false}
          open={this.state.deleteDashboardDialog}
          onRequestClose={this.handleDashboardDeleteClose}
          autoDetectWindowHeight={true}
        >
        <p>Are you sure to delete Dashboard {this.state.dashboard} ?</p>
        </Dialog>

        
      </div>
      </MuiThemeProvider>
    );
  }
}

export default App;

