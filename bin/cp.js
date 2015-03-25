#!/usr/bin/env node

var cherryPicker = require('./../cherryPicker');

console.log("###############\n");

console.log("let's pick the cherries");
console.log("type in the full ticket name like 'LHAS-1337'");
console.log("this tool will output the SHA commit hases for give tickets");

console.log("\n###############\n");

cherryPicker.run();