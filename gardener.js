module.exports = (function() {

    var colors = require('colors')
        , exec = require('child_process').exec
        , testHashes = [];

    function _getTickets() {
        return new Promise(function(resolve) {
            var readline = require('readline')
                , tickets = [];

            var _read = function() {
                var rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                rl.question(colors.yellow("Ticket number pls or 'done': "), function(ticketString) {
                    rl.close();

                    if (ticketString === "done") {
                        _drawCherry();
                        resolve(tickets);
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
        });
    }

    function _getHashes(tickets) {
        var promises = [];

        tickets.forEach(function(ticket) {
            var prom = new Promise(function(resolve) {
                _getLog(ticket).then(resolve);
            });
            promises.push(prom);
        });

        return Promise.all(promises);
    }

    function _getLog(ticket) {
        return new Promise(function(resolve, reject) {
            var cmd = "git log --reverse --grep=\"" + ticket + "\" | grep \"^commit\" | sed \"s/commit/git cherry-pick/g\"";

            exec(cmd, function(error, stdout, stderr) {
                if (error) {
                    reject(error, stderr);
                } else {
                    resolve(stdout);
                    stdout.split("\n").forEach(function(hash) {
                        if (hash.length) {
                            testHashes.push(hash.replace("git cherry-pick", "").replace("\n", ""));
                        }
                    });
                }
            });
        });
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
            var prom = new Promise(function(resolve) {
                _testHash(hash).then(resolve);
            });
            promises.push(prom);
        });

        return Promise.all(promises);
    }

    function _testHash(hash) {
        return new Promise(function(resolve, reject) {
            var cmd = "git log " + hash + " -n 1";

            exec(cmd, function(error, stdout, stderr) {
                if (error) {
                    reject(error, stderr);
                } else {
                    resolve(stdout);
                }
            });

        });
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
        _drawCherry();

        if (process.argv[2]) {
            _getHashes([process.argv[2]])
                .then(_printHashes)
                .then(_testHashes)
                .then(_printTestHashes);
        } else {
            _getTickets()
                .then(_getHashes)
                .then(_printHashes)
                .then(_testHashes)
                .then(_printTestHashes);
        }
    }

    return {
        pick: pick
    };
})();
