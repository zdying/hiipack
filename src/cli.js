#!/usr/bin/env node
var child_process = require('child_process');
var os = require('os');
var path = require('path');

var globalRoot = child_process.execSync('npm root -g').toString().trim();
var hiipackRoot = path.resolve(__dirname, '..', 'node_modules');
var hiipackTempRoot = os.tmpdir() + '/hiipack_cache';

var NODE_PATH = process.env.NODE_PATH;
process.env.NODE_PATH = [
    hiipackRoot,
    globalRoot,
    hiipackTempRoot
].join(':') + (NODE_PATH ? ':' + NODE_PATH : '');

child_process.fork(__dirname + '/hii.js', process.argv.slice(2));