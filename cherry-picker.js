#!/usr/bin/env node

var exec = require('child_process').exec
  , readline = require('readline')
  , Q = require('q')
  , deferred = Q.defer()
  , tickets = [];

Q.fcall(hello)
  .then(getTicket)
  .then(getHases);

function hello() {
  console.log("###############\n");
  console.log("let's pick the cherrys");
  console.log("type in the full ticket name like 'LHAS-1337'");
  console.log("this tool will output the SHA commit hases for give tickets");
  console.log("\n###############");
}

function getTicket() {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question("Ticket number pls or 'done': ", function(ticketString) {
    rl.close();

    if (ticketString === "done") {
      deferred.resolve(tickets);
    } else {
      if (ticketString.length) {
        tickets.push(ticketString);
      }

      console.log("your tickets", tickets);
      getTicket();
    }
  });

  return deferred.promise;
}

function getHases(tickets) {
  var promises = [];

  tickets.forEach(function(ticket) {
    getLog(ticket, function(result) {
      deferred.resolve(result);
    });
    promises.push(deferred.promise);
  });

  return Q.all(promises);
}

function getLog(ticket) {
  console.log("getLog");
  var cmd = "git log --grep='" + ticket + "' | grep 'commit' | sed 's/commit/git cherry-pick/g'";

  console.log("cmd: ", cmd);
  exec(cmd, function(error, stdout, stderr) {
    if (error) {
      deferred.reject(error, stderr);
    } else {
      console.log("out");
      console.log(stdout);
      deferred.resolve(stdout);
    }
  });

  return deferred.promise;
}