require("dotenv").config();
const cors= require("cors");
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use('/', indexRouter);
// app.use('/users', usersRouter);
//if request no match to any route
app.use((req,res,next)=>{
    const exeption=new Error("I can't fine the path");
    exeption.statusCode=404;
    next(exeption)
});
//customize express error handling middleware
app.use((err,req,res,next)=>{
        res.status(err.statusCode).send(err.message)
});
module.exports = app;
