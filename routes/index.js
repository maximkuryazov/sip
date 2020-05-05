const express = require('express');
const app = express();
const server = require('http').Server(app);
var router = express.Router();
const { spawn } = require("child_process");
const dotenv = require('dotenv').config();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

const Process = require('./process');
Process.bindSocket();

const userModel = require('../models/user');
const processModel = require('../models/process');

const sequelize = require("../models/connector");
sequelize.tryToConnect();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'Express',
    console: "",
    socketPort: process.env.SOCKET_PORT, 
    port: process.env.PORT,
    authorized: req.session.user_id
  });
});

router.get('/sipp', function(req, res, next) {
  console.log("SESSION SIPP: ", req.session);
  console.log("COOKIE: ", req.cookies);
  res.render('index', { 
    title: 'Express', 
    console: "", 
    socketPort: process.env.SOCKET_PORT, 
    port: process.env.PORT,
    authorized: req.session.user_id
  });
});

router.get('/sipp/help', function(req, res, next) {

  const ls = spawn("sipp", ["-help"]);

  ls.stdout.on("data", data => {
      console.log(`stdout: ${data}`);
      res.render('index', { title: 'Express', console: data });
  });

  ls.stderr.on("data", data => {
      console.log(`stderr: ${data}`);
  });

  ls.on('error', (error) => {
      console.log(`error: ${error.message}`);
  });

  ls.on("close", code => {
      console.log(`child Processexited with code ${code}`);
  });

});

router.get('/sipp/user/authorize', async function (req, res, next) {
  try {
    await userModel.authorizeUser(req.query.name, req.query.password, req);
    res.status(200);
    res.header("Access-Control-Allow-Origin", "http://127.0.0.1:" + process.env.PORT);
    res.json({ status: "OK" });
  } catch(e) {
    res.status(500);
    res.json({ status: "Authorization error." });
  }
  console.log("SESSION: ", req.session);
});

router.get('/sipp/user/create', async function (req, res, next) {
  try {
    await userModel.createUser(req.query.name, req.query.password);
    res.status(200);
    res.json({ status: "OK" });
  } catch (e) {
    res.status(200);
    res.json({ status: "Error", error: e.message, message: e.message === "SequelizeUniqueConstraintError: Validation error" ? "User already exists." : "" });
  }
});

// ["-sn", "uac", "127.0.0.1"]

router.post('/sipp/start', multipartMiddleware, Process.start());

router.get('/sipp/kill', Process.kill);

router.get('/sipp/pause', Process.pause);

router.get('/sipp/resume', Process.resume);

module.exports = router;

//sipp -sf sipp_reg_UAC_v02.xml -inf auth_users.csv -infindex auth_users.csv 0 10.0.200.66:7060 -r 10