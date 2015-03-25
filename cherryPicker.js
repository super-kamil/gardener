module.exports = (function() {

  var Q = require('q')
    , exec = require('child_process').exec
    , testHashes = [];

  function _getTickets() {
    var deferred = Q.defer()
      , readline = require('readline')
      , tickets = [];

    var _read = function() {
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

          console.log("your tickets so far: ", tickets);
          _read();
        }
      });
    };

    _read();

    return deferred.promise;
  }

  function _getHashes(tickets) {
    var promises = [];

    tickets.forEach(function(ticket) {
      var deferred = Q.defer();
      _getLog(ticket).then(deferred.resolve);
      promises.push(deferred.promise);
    });

    return Q.all(promises);
  }

  function _getLog(ticket) {
    var deferred = Q.defer()
      , cmd = "git log --reverse --grep=\"" + ticket + "\" | grep \"^commit\" | sed \"s/commit/git cherry-pick/g\"";

    exec(cmd, function(error, stdout, stderr) {
      if (error) {
        deferred.reject(error, stderr);
      } else {
        deferred.resolve(stdout);
        testHashes.push(stdout.replace("git cherry-pick", "").replace("\n", ""));
      }
    });

    return deferred.promise;
  }

  function _printHashes(logs) {
    console.log("\n###############");
    console.log("your commands\n");

    logs.forEach(function(log) {
      console.log(log.replace("\n", ""));
    });
  }

  function _testHashes() {
    var promises = [];

    console.log("\n###############");
    console.log("please compare the commits\n");

    testHashes.forEach(function(hash) {
      var deferred = Q.defer();
      _testHash(hash).then(deferred.resolve);
      promises.push(deferred.promise);
    });

    return Q.all(promises);
  }

  function _testHash(hash) {
    var deferred = Q.defer()
      , cmd = "git log " + hash + " -n 1";

    exec(cmd, function(error, stdout, stderr) {
      if (error) {
        deferred.reject(error, stderr);
      } else {
        deferred.resolve(stdout);
      }
    });

    return deferred.promise;
  }

  function _printTestHashes(hashes) {
    hashes.forEach(function(hash) {
      console.log(hash);
    });
  }

  function run() {
    _getTickets()
      .then(_getHashes)
      .then(_printHashes)

      .then(_testHashes)
      .then(_printTestHashes);
  }

  return {
    run: run
  };
})();
