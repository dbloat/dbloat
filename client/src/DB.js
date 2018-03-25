
import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import List, {
  
  ListItem,
  makeSelectable
} from 'material-ui/List';
import {Tabs, Tab} from 'material-ui/Tabs';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { FlatButton, RaisedButton, Dialog, DialogActions, DialogTitle} from "material-ui";
import IconButton from 'material-ui/IconButton';
import TextField from "material-ui/TextField";
import DBIcon from 'material-ui/svg-icons/places/kitchen';
import CancelIcon from 'material-ui-icons/Cancel';
import OKIcon from 'material-ui-icons/Done';
import { gray500 } from 'material-ui/styles/colors.js'
import DeleteIcon from 'material-ui-icons/Delete';
import RefreshIcon from 'material-ui-icons/Refresh';
import TimeAgo from 'react-timeago';
import CodeMirror from 'react-codemirror';
require ('codemirror/mode/sql/sql');
import { red500 } from 'material-ui/styles/colors.js'
import Pager from 'react-pager';
import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  LineSeries,
  MarkSeries,
  Hint
} from 'react-vis';

const api = require('./api');

class DB extends Component {

 
  constructor() {
    super();
    this.state = {
      response: '',
      error: '',
      snaplist: [],
      snappage: [],
      snappageNum: 0,
      snappageTotal: 1,
      snappageVisible: 10,
      querylist: [],
      first: '',      
      second: '',
      dbname: '', 
      addQueryDialog: false,
      deleteQueryDialog: false,
      newQueryName : '',
      newQuerySQL : '',
      editQuery: false,
      oldName: '',
      x: 0, y: 0, ymax: 1, plotData : [ ]
    };
  }

  componentDidMount() {
    this.setState({ dbname: this.props.location.pathname.split('/').reverse()[0] });
    this.updateSnapList();    
    this.updateQueries();
  }


  handleReport = () =>  {
    let name = this.props.location.pathname.split('/').reverse()[0]
    this.props.history.push('/report/'+name+'/'+this.state.first+'/'+this.state.second);
  };

  handleCancel = () =>  {
    this.setState({first : '', second: ''});     
    this.updateSnapList();
  };



  deleteSnapshot = (t) =>  {
    var data = {
      name: this.props.location.pathname.split('/').reverse()[0],
      time: t
    };
         let snaps = this.state.snaplist;
         for( var sind in snaps ) {
           console.log(snaps[sind][0]+';'+t);

             if( snaps[sind][0] == t )
             {
               snaps.splice(sind,1);
               break;
             }
           
         }
    this.setState({snaplist: snaps});
    this.setSnapPage(snaps, this.state.snappageNum);

    api.callPostApi('/api/delsnap', data)
      .then((res) => { 
       })
      .catch((err) => { 
         console.log(err); 
         this.updateSnapList();
         this.setState({error: String(err)}); 
         if ( err == "Error: Not Authorized")
            this.props.history.push('/auth');

      });
  };

  updateQueries = () => { 
    var data = {
      dbname: this.props.location.pathname.split('/').reverse()[0],
    };
    
    api.callPostApi('/api/listqueries', data)
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

  performQuery = (query) => { 
    var data = {
      name: query.name,
    };
    let querylist = this.state.querylist;
    for (var i in querylist) {
      if (querylist[i].name == query.name)
      {
        querylist[i].lastrefresh = new Date + 1000000;
        break;
      }
    }
    this.setState({querylist: querylist});
    api.callPostApi('/api/performquery', data)
      .then((res) => {
         let querylist = this.state.querylist;
         for (var i in querylist) {
           if (querylist[i].name == res.name)
           {
             querylist[i].res = res.rows;
             querylist[i].lastrefresh = new Date(res.update);
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

  handlePageChanged = (page) => {
     this.setState({ snappageNum : page });
     this.setSnapPage(this.state.snaplist, page);
  } 

  setSnapPage = (snaplist, page) => {
    let pageSize = 15;
    let snapPage = [];
    for (var i = page*pageSize; i < (page+1)*pageSize; i++) {
       if ( i < snaplist.length ) snapPage.push(snaplist[i]);             
    }
    this.setState({ snappage: snapPage, snappageTotal: snaplist.length/pageSize  });
  }
  
  dateFormat = (v) => {
    let d = new Date(v);
    var day = d.getDate();
    var month = d.getMonth()+1;
    var year = d.getFullYear();
    var hour = d.getHours();
    var min = d.getMinutes();
    if(min.toString().length == 1) min = "0"+min;
    return day  + "-" + month + "-" +year + " " + hour + ":" +min;
  }

  updateSnapList = () => {
    var data = {
      name: this.props.location.pathname.split('/').reverse()[0],
    };
    api.callPostApi('/api/listsnap', data)
      .then((res) => {
         let snaps = res.snaps;
         let data = [];
         let szmax = 0;
         for(var snapind in snaps)
         {
           let datay = this.pRound(snaps[snapind][1]/1024/1024/1024);
           let datael = { x: Math.round(snaps[snapind][2]*1000), y : datay };
           if(szmax < datael.y) szmax = datael.y;
           data.push(datael);
         }
         this.setState( { plotData : data , ymax: szmax} );
         if(this.state.first != '')
         {
           let snapsf = new Array();
           let fnd = false;
           for(var snapind in snaps)
           {
             if(fnd) snapsf.push(snaps[snapind]);
             if(snaps[snapind][0] == this.state.first) fnd = true;
           } 
           this.setState({snaplist: snapsf});           
           this.setSnapPage(snapsf, this.state.snappageNum);
         } else
         {
            this.setState({snaplist: res.snaps});
            this.setSnapPage(res.snaps, this.state.snappageNum);
         }
       })
      .catch((err) => { 
           console.log(err); 
           this.setState({error: String(err)}); 
           if ( err == "Error: Not Authorized")
            this.props.history.push('/auth');

       });
  }




  handleSnapClick = (n) => {
    console.log(n);
    if (this.state.first == '') this.setState({first : n}); else
    if (this.state.second == '') this.setState({second : n}); 
    this.updateSnapList();     
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


  _buildSnapList = (el) => {
       let text = el[0];
            var actions =              
            (
                <IconButton
                    tooltip='Delete'
                    onClick={(e) => { e.stopPropagation(); this.deleteSnapshot(text); } }
                >
                    <DeleteIcon color={red500} /> 
                </IconButton>
            );  
       return           <ListItem  key={el[0]} leftIcon={<DBIcon />} primaryText={text} onClick={() => { this.handleSnapClick(text); }} rightIconButton={actions}  />      
  }


  addQuery = () =>  {
    var data;
    if(this.state.editQuery)
    data = {
      dbname: this.props.location.pathname.split('/').reverse()[0],
      qname: this.state.oldName,
      qnewname: this.state.newQueryName,
      sql: this.state.newQuerySQL,
      edit: this.state.editQuery,
      priority: this.state.newQueryPriority,
      update: this.state.newQueryUpdate
    };  else
    data = {
      dbname: this.props.location.pathname.split('/').reverse()[0],
      qname: this.state.newQueryName,
      sql: this.state.newQuerySQL,
      edit: this.state.editQuery,
      priority: this.state.newQueryPriority,
      update: this.state.newQueryUpdate
    }; 

    api.callPostApi('/api/addquery', data)
      .then((res) => {
         this.handleClose();
         this.updateQueries();
       })
      .catch((err) => { console.log(err); this.setState({error: String(err)}); });
  };

  deleteQuery = () =>  {
    var data;
    data = {
      name: this.state.deleteQuery
    };  

    api.callPostApi('/api/delquery', data)
      .then((res) => {
         this.handleDeleteClose();
         this.updateQueries();
       })
      .catch((err) => { console.log(err); this.setState({error: String(err)}); });
  };


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
            <Card key={el.name} style={{ width : "90%", margin: "20px" }} onClick={ () => { this.handleLoad(el.name,el.sql,el.priority,el.update); }} >
           <CardHeader title={el.name} style={{ backgroundColor: "#80CBC4"}}  >
              <TimeAgo style={{ fontSize: "9pt", float: "right", position: "relative", bottom: "15px" }}date={el.lastrefresh} formatter={this.agoFormatter} />
           </CardHeader>
    <CardActions>
      <FlatButton style={{ minWidth: "20px" }} icon={<DeleteIcon color={gray500} />} 
        onClick={(e) => { e.stopPropagation(); this.setState({ deleteQuery: el.name, deleteQueryDialog: true }); } } />
      <FlatButton style={{ minWidth: "20px" }} icon={<RefreshIcon color={gray500} />} 
        onClick={(e) => { e.stopPropagation(); this.performQuery(el);  } } />
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

  handleOpen = () =>  {
    this.setState({addQueryDialog: true, newQueryName: '', newQuerySQL: '', newQueryPriority: '', newQueryUpdate: 0, editQuery: false });
  };

  handleLoad = (name, sql, priority, update) =>  {
    this.setState({addQueryDialog: true, newQueryName: name, newQuerySQL: sql, newQueryPriority: priority, newQueryUpdate: update, editQuery: true, oldName: name });
  };

  handleClose = () =>  {
    this.setState({addQueryDialog: false});
  };

  handleDeleteClose = () =>  {
    this.setState({deleteQueryDialog: false});
  };


  _rememberPlotValue = (value) => {
     this.setState({ plotValue: value });
  } 


  render() {
    let SelectableList = makeSelectable(List);

  const style = {
    textAlign: 'left',
    width : '100%',
    display: 'inline-block',
    padding: '10px'
  };

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

    const CHART_MARGINS = {left: 50, right: 10, top: 10, bottom: 120};

    return (
      <MuiThemeProvider>
      <div className="App">
        <Tabs style={{ width : "90%" }}  >
        <Tab label="Space Tracking" style={{ backgroundColor: "#7986CB" }} >
        <Paper label="Snapshots" style={style} >
        <h2>Snapshots - {this.state.dbname}</h2>
        {this.state.first != '' && 
        <p>From Snapshot: {this.state.first}</p>}
        {this.state.second != '' &&
        <p>To Snapshot: {this.state.second}</p>}
          {this.state.first != '' && <FlatButton
             icon={<CancelIcon />} tooltip="Cancel" onClick={this.handleCancel}
           />}
          {this.state.second != '' && 
          <FlatButton
             icon={<OKIcon />} tooltip="Get Report" onClick={this.handleReport}
           />}
        </Paper>
        <List>
         {this.state.snappage.map(this._buildSnapList)}
        </List>
            <Pager
                total={this.state.snappageTotal}
                current={this.state.snappageNum}
                visiblePages={this.state.snappageVisible}
                titles={{ first: '<', last: '>' }}
                className="pagination-sm pull-right"
                onPageChanged={this.handlePageChanged}
            />
        </Tab>
        <Tab label="Queries" style={{ backgroundColor: "#F06292" }} >
        <Paper label="Dashboard" style={style} >        
        <h2>Dashboard - {this.state.dbname}</h2>
        <RaisedButton label="Add Query" backgroundColor="#EC407A" onClick={this.handleOpen}/>
         {this.state.querylist.map(this._buildQueryList)}
        </Paper>
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
          title="Add/Edit Query"
          actions={actions}
          modal={false}
          open={this.state.addQueryDialog}
          onRequestClose={this.handleClose}
          autoDetectWindowHeight={true}
        >
        <p> {this.state.error} </p> 
        <TextField onChange={(e, value) => { this.setState({ newQueryName: value } ); }} hintText="Enter Query name" value={this.state.newQueryName} floatingLabelText="Name" />
        <TextField onChange={(e, value) => { this.setState({ newQueryUpdate: value } ); }} hintText="Update interval (minutes)" value={this.state.newQueryUpdate} floatingLabelText="Update Interval (minutes)" />
        <CodeMirror value={this.state.newQuerySQL} 
             onChange={(value) => { this.setState({ newQuerySQL: value } );  }}
             options = {{ lineNumbers : true, mode : 'text/x-sql' }} /> 
        <TextField onChange={(e, value) => { this.setState({ newQueryPriority: value } ); }} hintText="Priority" value={this.state.newQueryPriority} floatingLabelText="Priority" />        
        </Dialog>
      
      </Tab>
      <Tab label="Space Plots" style={{ backgroundColor: "#81C784" }} >
       <Paper label="Database size" style={style} >
        <h2>DB Size - {this.state.dbname}</h2>

       <FlexibleWidthXYPlot
        height={300}
        margin={CHART_MARGINS}>
        <VerticalGridLines />
        <HorizontalGridLines />
        <XAxis tickFormat={ v => (this.dateFormat(v)).toString() } tickLabelAngle={-45} height={100} />
        <YAxis title="Size (GBytes)" />
        <LineSeries  data={this.state.plotData}/>
        <MarkSeries
          onNearestX={this._rememberPlotValue}
          data={this.state.plotData}  size={3} />
        {this.state.plotValue ?
          <LineSeries
            data={[{x: this.state.plotValue.x, y: this.state.plotValue.y}, {x: this.state.plotValue.x, y: this.state.ymax}]}
            stroke="black"
          /> : null
        }
        {this.state.plotValue ?
          <Hint
            value={this.state.plotValue}
            align={ {horizontal: Hint.AUTO, vertical: Hint.ALIGN.TOP_EDGE} }
          >
            <div className="rv-hint__content">
              { `${(this.dateFormat(this.state.plotValue.x)).toString()}: ${this.state.plotValue.y} GBytes` }
            </div>
          </Hint> : null
        }
      </FlexibleWidthXYPlot>
      </Paper>
      </Tab>
      </Tabs>
       </div>

      </MuiThemeProvider>
    );
  }
}

export default DB;

