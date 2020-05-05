const { spawn } = require("child_process");
const socketServer = require('http').createServer();
const io = require('socket.io')(socketServer);
const fs = require('fs');
const dotenv = require('dotenv').config();
const processModel = require('../models/process');
const util = require('util');
const rename = util.promisify(fs.rename);

socketServer.listen(process.env.SOCKET_PORT);

const settings = {
  uac: {},
  paused: false,
  socket: null,
};

module.exports = {

  bindSocket: function () {
    io.on('connection', (socket) => {
      settings.socket = socket;
    });
  },

  start: function (defaultParams) {

    return async function(req, res, next) {  
      
      console.log("UAC: ", settings.uac);
      console.log("FILES: ", req.files);
      console.log("PORT: ", req.body.port);
      console.log("SESSION: ", req.session.user_id);
      
      let xmlFile;
      let csvFile;
      let fileError;

      try {
        xmlFile = "scripts/" + req.files["xmlFile"].originalFilename;
        csvFile = "scripts/" + req.files["csvFile"].originalFilename;
        await rename(req.files["xmlFile"].path, xmlFile);
        await rename(req.files["csvFile"].path, csvFile);
      } catch(e) {
        console.error("ERROR: ", e);
        fileError = e;
      }

      let uac = settings.uac[req.session.user_id];
      let params;

      if ((!uac || uac.killed) && !settings.paused) {
        if (!defaultParams) {
          params = ["-sf", fileError ? req.body.xml : xmlFile, "-inf", fileError ? req.body.csv : csvFile, "-infindex", req.body.csv, "0", req.body.server + ":" + req.body.port, "-r", req.body.cpu]
        }
        console.log("PARAMS: ", params);
        settings.uac[req.session.user_id] = spawn(process.env.SIPP, params);
        uac = settings.uac[req.session.user_id];
        await processModel.createProcess(uac.pid, req.session.user_id);
      }
        
      uac.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
        settings.socket.emit('xml', { text: data.toString(), params: params });
      });

      uac.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
        settings.paused = false;
      });
    
      uac.on('error', (error) => {
          console.log(`error: ${error.message}`);
          uac.kill();
          settings.paused = false;
      });
    
      uac.on("close", code => {
          console.log(`child process exited with code ${code}`);
          uac.kill();
          settings.paused = false;
          //settings.socket.emit('kill', { text: "KILLED", console: "Process killed: " + uac.pid + "<br />" });
      });
  
      res.json({ body: req.body });
    }
  },

  kill: async function(req, res, next) {
    console.log("SESSION: ", req.session.user_id);
    const uac = settings.uac[req.session.user_id];
    if (uac) {
      uac.kill();
      console.log("KILLED: ", uac.killed);
      uac.killed = true; // чтобы когда введён некорректный файл, устанавливался флаг, потому что иначе он при килл не устанавливается
      settings.paused = false;
    }
    await processModel.killProcess(uac.pid);
    res.status(200);
    //res.send("Process killed: " + this.uac.pid);
    res.json({ console: "Process killed: " + uac.pid + "<br />" });
    // res.render('index', { title: 'Express', console: "Process killed: " + uac.pid });
  },

  pause: function(req, res, next) {
    try {
      const uac = settings.uac[req.session.user_id];
      if (uac && !settings.paused) {
        uac.kill('SIGSTOP');
        settings.paused = true;
      }
      //res.render('index', { title: 'Express', console: "Process stopped: " + uac.pid });
      res.status(200);
      res.json({ console: "Process stopped: " + uac.pid + "<br />" });
      //res.send("Process stopped: ", uac.pid);
    } catch(e) {
      console.log("PAUSE ERROR: ", e)
    }

  },
  
  resume: function(req, res, next) {
    const uac = settings.uac[req.session.user_id];
    if (uac && settings.paused) {
      uac.kill('SIGCONT');
      settings.paused = false;
      res.status(200);
      res.json({ console: "Process resumed: " + uac.pid + "<br />" });
    }
    //res.render('index', { title: 'Express', console: "Process resumed: " + uac.pid });
  }

}