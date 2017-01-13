#!/usr/bin/env node
var child_process = require('child_process');
var nodePath = require('./node_path');
process.env.NODE_PATH = nodePath();

child_process.fork(__dirname + '/hii.js', process.argv.slice(2), {
    execArgv: []
});