
onload = function () {

  var $ = function (selector) {
    return document.querySelector(selector);
  }

  const socketPort = $('#socketPort').innerHTML;
  const port = $('#expressPort').innerHTML;
  const authorized = $("#authorized").innerHTML;
  const socket = io('http://127.0.0.1:' + socketPort);

  socket.on('kill', (data) => {
    var screen = document.getElementById('screen');
    screen.innerHTML += data.console;
    screen.scrollTop = screen.scrollHeight;
  });

  socket.on('xml', (data) => {

    console.log("Data params: ", data.params);

    var screen = document.getElementById('screen');
    console.log("Data text: ", data.text);

    if (/^Last Error/.test(data.text)) {
      screen .innerHTML += data.text;
    } else {
      screen .innerHTML = data.text
      .replace(/:/, ":<p \/>")
      .replace(/sockets/, "sockets<p \/>")
      .replace(/Msg/, "Msg<p \/>")
      .replace(/(.* ---------->)/g, "<p \/>$1")
      .replace(/(.* <---------)/g, "<p \/>$1")
      .replace(/Change Screen --/, "Change Screen --<p \/>")
      .replace(/Remote-host/, "Remote-host<br \/>")
      .replace(/([0-9]+ new calls)/, "<p \/>$1")
    }
  });

  const server = "http://127.0.0.1:" + port;

  var app = new Vue({
    el: '#screen',
    data: {
      message: 'Hello Vue!'
    }
  });

  var screen = document.getElementById('screen');
  var pause = document.getElementById('pause');
  var resume = document.getElementById('resume');
  var start = document.getElementById('start');
  var stop = document.getElementById('stop');

  if (!authorized) {
    start.disabled =  pause.disabled = resume.disabled = stop.disabled = true;
  }

  start.onclick = function () {

    let formData = new FormData();
    formData.append('xmlFile', $("#xml").files[0]);
    formData.append('csvFile', $("#csv").files[0]);
    formData.append('xml', "sipp_reg_UAC_v02.xml");
    formData.append('csv', "auth_users.csv");
    formData.append("cpu", $("#cpu").value);
    formData.append("server", $("#server").value);
    formData.append("port", $("#port").value);

    axios.post(server + "/sipp/start", /*{
      
      xml: 'sipp_reg_UAC_v02.xml',
      csv: "auth_users.csv",
      cpu: $("#cpu").value,
      server: $("#server").value,
      port: $("#port").value,
  
    },*/ formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
     }).then(response => {
      // alert(response.data.xml);
      // alert(response.data.csv);
      // alert(response.data.cpu);
      // alert(response.data.server);
      // alert(response.data.port);
      pause.disabled = false;
      resume.disabled  = true;
      start.disabled = true;
      stop.disabled = false;
    });
  };
  
  stop.onclick = function () {
    axios.get(server + "/sipp/kill").then(response => {
      screen.innerHTML += response.data.console;
      screen.scrollTop = screen.scrollHeight;
      pause.disabled = true;
      resume.disabled = true;
      start.disabled = false;
      stop.disabled = true;
    });
  };

  pause.onclick = function () {
    axios.get(server + "/sipp/pause").then(response => {
      screen.innerHTML += response.data.console;
      screen.scrollTop = screen.scrollHeight;
      pause.disabled = true;
      resume.disabled = false;
    });
  };

  resume.onclick = function () {
    axios.get(server + "/sipp/resume").then(response => {
      screen.innerHTML += response.data.console;
      screen.scrollTop = screen.scrollHeight;
      pause.disabled = false;
      resume.disabled = true;
    });
  };

  $("#authorize").onclick = function () {
    let login =  prompt("Login: "); // "user2"; // 
    let password =  prompt("Password: "); //12345678; //
    axios.get(server + `/sipp/user/authorize?name=${login}&password=${password}`).then(response => {
      alert("Authorized");
      start.disabled = false;
    }).catch(error => {
      alert("Error");
    });
  }

  $("#register").onclick = function () {
    let login = prompt("Login: ");
    let password = prompt("Password: ");
    axios.get(server + `/sipp/user/create?name=${login}&password=${password}`).then(response => {
      alert(JSON.stringify(response));
    }).catch(error => {
      alert("Error");
    });
  }

}