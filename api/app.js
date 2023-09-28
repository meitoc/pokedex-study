require('dotenv').config();
const cors = require('cors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/api');

const fs = require("fs");
const csv = require("csvtojson")

var app = express();

const corsOptions = {
  origin: process.env.FRONT_END_BASEURL,
  methods: 'GET,POST,OPTIONS', // Cấu hình các phương thức HTTP cho phép truy cập CORS
  allowedHeaders: 'Content-Type,Authorization' // Cấu hình các tiêu đề cho phép truy cập CORS
};
// console.log(corsOptions.origin)

app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONT_END_BASEURL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
// app.use((req, res, next) => {
//     res.setHeader(
//       "Access-Control-Allow-Origin",
//       "https://glistening-bunny-69e8e7.netlify.app/"
//     );
//     res.setHeader(
//       "Access-Control-Allow-Methods",
//       "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
//     );
//     res.setHeader(
//       "Access-Control-Allow-Headers",
//       "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
//     );
//     res.setHeader("Access-Control-Allow-Credentials", true);
//     res.setHeader("Access-Control-Allow-Private-Network", true);
//     //  Firefox caps this at 24 hours (86400 seconds). Chromium (starting in v76) caps at 2 hours (7200 seconds). The default value is 5 seconds.
//     res.setHeader("Access-Control-Max-Age", 7200);
  
//     next();
//   });

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