#!/usr/bin/env node

var exec = require('child_process').exec
  , readline = require('readline')
  , Q = require('q')
  , tickets = [];

Q.fcall(hello)
  .then(getTicket)
  .then(getHashes)
  .then(printHashes);

function hello() {
  console.log("###############\n");
  console.log("let's pick the cherrys");
  console.log("type in the full ticket name like 'LHAS-1337'");
  console.log("this tool will output the SHA commit hases for give tickets");
  console.log("\n###############\n");
}

function getTicket() {
  console.log("getTicket()");
  var deferred = Q.defer();

  var read = function() {
    console.log("read()");
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
        read();
      }
    });
  };

  read();

  return deferred.promise;
}

function getHashes(tickets) {
  console.log("getHashes()");
  var promises = [];

  tickets.forEach(function(ticket) {
    var deferred = Q.defer();

    getLog(ticket).then(function(result) {
      console.log("getLog done", result);
      deferred.resolve(result);
    });

    promises.push(deferred.promise);
  });

  return Q.all(promises);
}

function getLog(ticket) {
  console.log("getLog()");
  var deferred = Q.defer();
  var cmd = "git log --grep=\"" + ticket + "\" | grep \"commit\" | sed \"s/commit/git cherry-pick/g\"";

  exec(cmd, function(error, stdout, stderr) {
    if (error) {
      console.log(stderr);
      deferred.reject(error, stderr);
    } else {
      console.log("stdout", stdout);
      deferred.resolve(stdout);
    }
  });

  return deferred.promise;
}

function printHashes(logs) {
  console.log("printHashes()");

  logs.forEach(function(log, qwe) {
    console.log(log, qwe);
    // console.log(log.replace("\n", ""));
  });
}