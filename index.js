
//to create the servre, read the csv file and check database
const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');
const csv = require('csv-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');

