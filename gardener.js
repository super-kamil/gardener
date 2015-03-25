module.exports = (function() {

  var Q = require('q')
    , colors = require('colors')
    , exec = require('child_process').exec
    , testHashes = [];

  function _getTickets() {
    var deferred = Q.defer()
      , readline = require('readline')
      , tickets = [];

    _drawCherry();

    var _read = function() {
      var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question(colors.yellow("Ticket number pls or 'done': "), function(ticketString) {
        rl.close();

        if (ticketString === "done") {
          _drawCherry();
          deferred.resolve(tickets);
        } else {
          if (ticketString.length) {
            tickets.push(ticketString);
          }

          console.log("\n", "your tickets so far: ", tickets, "\n");
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
        stdout.split("\n").forEach(function(hash) {
          if (hash.length) {
            testHashes.push(hash.replace("git cherry-pick", "").replace("\n", ""));
          }
        });
      }
    });

    return deferred.promise;
  }

  function _printHashes(logs) {
    console.log(colors.green("\n###############"));
    console.log(colors.green("###############"));
    console.log(colors.green("your commands"), "\n");

    logs.forEach(function(log) {
      console.log(colors.cyan(log));
    });

    console.log(colors.green("end of your commands"));
    console.log(colors.green("###############"));
    console.log(colors.green("###############"));
  }

  function _testHashes() {
    var promises = [];
    console.log(colors.cyan("\nplease compare the commits"), "\n");

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

  function _drawCherry() {
    console.log("\n");
    console.log(colors.green("   __.--~~.,-.__"));
    console.log(colors.green("   `~-._.-(`-.__`-."));
    console.log(colors.green("           \\    `~~`"));
    console.log(colors.red("      .--./ \\"));
    console.log(colors.red("     /#   \\  \\.--."));
    console.log(colors.red("     \\    /  /#   \\"));
    console.log(colors.red("      '--'   \\    /"));
    console.log(colors.red("              '--'"));
    console.log("\n");
  }

  function pick() {
    _getTickets()
      .then(_getHashes)
      .then(_printHashes)

      .then(_testHashes)
      .then(_printTestHashes);
  }

  return {
    pick: pick
  };
})();
