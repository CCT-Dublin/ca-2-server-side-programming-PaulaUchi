
//to create the servre, read the csv file and check database
const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');
const csv = require('csv-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet'); //to add httml security headers
const path = require('path');

//start the express server/node.js
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet()); // 
app.use(express.static('public'))

