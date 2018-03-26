# DBloat
Space monitoring and Dashboards for Oracle Databases

DBloat is a set of tools for DBA to improve Oracle Databases administration experince.

Features:
- Identification and monitoring of database fast-growing objects
- Database tables, indexes, lobs and their partitions relations and size information
- Database size plots
- Quick Access Dashboards, based on arbitrary SQL queries


## Screenshots
![DBloat_screen_menu](https://image.ibb.co/kQot9c/DBloat1.jpg)
![DBloat_screen_report](https://image.ibb.co/cVcmUc/DBloat2.jpg)
![DBloat_screen_plot](https://image.ibb.co/kC8qx7/DBloat3.jpg)

## Installation

1. Install Oracle Instant Client

http://www.oracle.com/technetwork/database/database-technologies/instant-client/overview/index.html

Download Oracle Instant Client and unpack it somewhere on server.

Set Environment variable LD_LIBRARY_PATH
```
export LD_LIBRARY_PATH=/home/dbloat/instantclient_12_2/
```

2. Install DBloat

Clone this repository somewhere on your server
```
git clone https://github.com/stffart/dbloat.git
```
Install required modules and run application
```
cd dbloat
npm install
npm run prod
```
DBloat web interface is accessible at URL
```
http://<your server>:8060/
```
Default account is admin with password admin

