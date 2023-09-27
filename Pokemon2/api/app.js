require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/api');

const fs = require("fs");
const csv = require("csvtojson")

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use('/api', usersRouter);

app.use((req,res,next)=>{
    const err=new Error("no data");
    err.statusCode = 404;
    next(err);
});
app.use((err,req,res,next)=>{
    res.status(err.statusCode).send(err.message);
});
// app.use('/', indexRouter);
// app.use(express.static('public'));
module.exports = app;