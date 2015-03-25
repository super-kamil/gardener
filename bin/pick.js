#!/usr/bin/env node

var gardener = require('./../gardener')
  , colors = require('colors');

console.log(colors.green("###############\n"));

console.log(colors.green("let's pick the cherries"));
console.log(colors.green("type in the full ticket name like 'LHAS-1337'"));
console.log(colors.green("this tool will output the SHA commit hases for give tickets"));

console.log(colors.green("\n###############\n"));

gardener.run();