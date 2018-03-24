import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import LinearProgress from 'material-ui/LinearProgress';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { FlatButton, RaisedButton, Dialog, DialogActions, DialogTitle} from "material-ui";
import TextField from "material-ui/TextField";
import DBIcon from 'material-ui/svg-icons/places/kitchen';
import CheckIcon from 'material-ui-icons/Done';
import { red500 } from 'material-ui/styles/colors.js'
import List, {

  ListItem,
  makeSelectable
} from 'material-ui/List';

const api = require('./api');


class App extends Component {

 
  constructor() {
    super();
    this.state = {
      response: '',
      error: '',
      info : { obj_type : '', obj_size: '', partitions: [] }
    };
  }

  componentDidMount() {
    this.setState({ owner : this.props.location.pathname.split('/')[3], dbobject : this.props.location.pathname.split('/')[4] });
    if(this.props.location.pathname.split('/').length > 5)
     this.setState({  dbpart: this.props.location.pathname.split('/')[5] });
    this.updateObjectInfo();
  }


  handleReport = () =>  {
  };

  handleCancel = () =>  {
  };


  updateObjectInfo = () => {
    var data = {
      dbname: this.props.location.pathname.split('/')[2],
      owner: this.props.location.pathname.split('/')[3],
      object_name: this.props.location.pathname.split('/')[4]
    };

    api.callPostApi('/api/objinfo', data)
      .then((res) => {
         console.log(res);
         this.setState({info: res.info });
       })
      .catch((err) => { console.log(err); this.setState({error: String(err)}); });

  }


  handleSnapClick = (n) => {
  }

  pRound = (n) => {
     return Math.round(n*100)/100;
  }

  wordSize = (size) => {
     if(size == null) return 'Not Defined';
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

  _buildPartList = (el) => {
    var text;
    if(el.lobname)
       text = el.name + '(' + el.lobname + ')'  + ' - ' + this.wordSize(el.size); else
       text = el.name + ' - ' + this.wordSize(el.size);
    if ( el.name == this.state.dbpart || el.lobname == this.state.dbpart )
      return       (    <ListItem style={{ padding: "0px" }}  key={el.name} leftIcon={<CheckIcon />} primaryText={text} onClick={() => { this.handlePartClick(el); }}  /> ); else
      return       (    <ListItem style={{ padding: "0px" }}  key={el.name} primaryText={text} onClick={() => { this.handlePartClick(el); }}  /> );
  }

  render() {

  const style = {
    textAlign: 'left',
    width : '90%',
    display: 'inline-block',
    padding: '10px'
  };

   let SelectableList = makeSelectable(List);
    return (
      <MuiThemeProvider>
      <div className="App">
        <Paper label="Object info" style={style} >
        <h2>Object - {this.state.owner}.{this.state.dbobject}</h2>
        <div class="ObjectInfo" >
        <p>Object Type: {this.state.info.obj_type}</p>
        <p>Object Size: {this.wordSize(this.state.info.obj_size)}</p>
        { this.state.info.obj_type == 'INDEX' &&
          <p>Index Table: {this.state.info.table_owner}.{this.state.info.table} (Size: {this.wordSize(this.state.info.table_size)})</p>
        }
        { this.state.info.obj_type == 'LOB' &&
          <p>LOB Table: {this.state.info.table_owner}.{this.state.info.table}</p>
        }
        </div>
        { this.state.info.partitions.length > 0 &&
         <div class="PartitionsList" > 
         <h3>Partitions</h3>
         <List>
           {this.state.info.partitions.map(this._buildPartList)}
         </List>
         </div>
        }
        </Paper>
      </div>
      </MuiThemeProvider>
    );
  }
}

export default App;

