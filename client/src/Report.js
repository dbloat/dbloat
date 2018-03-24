import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
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
import TextField from "material-ui/TextField";
import DBIcon from 'material-ui/svg-icons/places/kitchen';
import CancelIcon from 'material-ui-icons/Cancel';
import OKIcon from 'material-ui-icons/Done';
import { red500 } from 'material-ui/styles/colors.js'

const api = require('./api');


class App extends Component {

 
  constructor() {
    super();
    this.state = {
      response: '',
      error: '',
      rowlist: [],
      tbslist: [],
      tbs: 'ALL',
      totaldiff: 0
    };
  }

  componentDidMount() {
    this.updateRowList(this.state.tbs);    
    this.updateTBSList();
  }


  handleReport = () =>  {
  };

  handleCancel = () =>  {
  };


  updateTBSList = () => {
    var data = {
      name: this.props.location.pathname.split('/').reverse()[2]
    };

    api.callPostApi('/api/listtbs', data)
      .then((res) => {
         res.tbs.push(['ALL']);
         console.log(res);
         this.setState({tbslist: res.tbs });
       })
      .catch((err) => { console.log(err); this.setState({error: String(err)}); });

  }


  updateRowList = (filterTbs) => {
    var data = {
      second: this.props.location.pathname.split('/').reverse()[0],
      first: this.props.location.pathname.split('/').reverse()[1],
      name: this.props.location.pathname.split('/').reverse()[2],
      tbs: filterTbs
    };

    api.callPostApi('/api/snapreport', data)
      .then((res) => {
	 console.log(res);         
         let totaldiff = 0;
         for (var ind in res.rows) {
           totaldiff += res.rows[ind][4]; 
         }
         console.log(totaldiff);
         this.setState({rowlist: res.rows, dbname: data.name, first: data.first, second: data.second, totaldiff: totaldiff});
       })
      .catch((err) => { console.log(err); this.setState({error: String(err)}); });
  }

  handleTbsChange = (event, index, value) => { 
      this.setState({tbs : value});
      this.updateRowList(value);
  }

  handleSnapClick = (n) => {
  }

  pRound = (n) => {
     return Math.round(n*100)/100;
  }

  wordSize = (size) => {
     let oldSize = size;
     size /= 1024;
     if(size > 1) 
     {
       let oldSize = size;
       size /= 1024;
       if(size > 1) 
       {
         let oldSize = size;
         size /= 1024;
         if(size > 1) 
         {
            return this.pRound(size)+"  Gbytes";
         } else
         {
         return oldSize+"  Mbytes";
         }
       } else
       {
         return oldSize+"  bytes";
       }

     } else
     {
       return oldSize+" bytes";
     }
  }

  handleRowSelection = (index) => {
    let el = this.state.rowlist[index[0]]
    this.props.history.push('/dbobject/'+this.state.dbname+'/'+el[1]+'/'+el[2]+'/'+el[3]);
  }

  _buildDropDownMenu = (el) => {
     return <MenuItem value={el[0]} primaryText={el[0]} />
  }

  _buildSnapTable = (el) => {
       let impact = el[4] * 100/this.state.totaldiff;
       let change = this.pRound(el[4] * 100/el[5]);
       return           <TableRow ><TableRowColumn >{el[0]}</TableRowColumn><TableRowColumn style={{ width: 150 }}>{el[1]}</TableRowColumn><TableRowColumn >{el[2]}</TableRowColumn><TableRowColumn >{el[3]}</TableRowColumn><TableRowColumn style={{ width: 80 }}>{this.wordSize(el[5])}</TableRowColumn><TableRowColumn style={{ width: 80 }}>{this.wordSize(el[4])}</TableRowColumn><TableRowColumn style={{ width: 80 }}>{change} %</TableRowColumn><TableRowColumn style={{ width: 80 }}> <LinearProgress mode="determinate" value={impact} /></TableRowColumn></TableRow>    
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
        <h2>Report - {this.state.dbname}</h2>
        <p>From Snapshot: {this.state.first}</p>
        <p>To Snapshot: {this.state.second}</p>
        <DropDownMenu value={this.state.tbs} onChange={this.handleTbsChange} >
            {this.state.tbslist.map(this._buildDropDownMenu)}
        </DropDownMenu>
        <p>Total Delta: {this.wordSize(this.state.totaldiff)}</p>        
        </Paper>
        <Table onRowSelection={this.handleRowSelection} >
         <TableHeader  displaySelectAll={false}  adjustForCheckbox={false} >
          <TableRow>
           <TableHeaderColumn>Tablespace</TableHeaderColumn>
           <TableHeaderColumn style={{ width: 150 }}>Owner</TableHeaderColumn>
           <TableHeaderColumn>Segment</TableHeaderColumn>
           <TableHeaderColumn>Partition</TableHeaderColumn>
           <TableHeaderColumn style={{ width: 80 }}>Size</TableHeaderColumn>
           <TableHeaderColumn style={{ width: 80 }}>Delta</TableHeaderColumn>
           <TableHeaderColumn style={{ width: 80 }}>Changed</TableHeaderColumn>
           <TableHeaderColumn style={{ width: 80 }}>Impact %</TableHeaderColumn>
         </TableRow>
        </TableHeader>
         <TableBody displayRowCheckbox={false} >
         {this.state.rowlist.map(this._buildSnapTable)}
         </TableBody>
        </Table>
      </div>
      </MuiThemeProvider>
    );
  }
}

export default App;

