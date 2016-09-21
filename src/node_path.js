/**
 * @file
 * @author zdying
 */
var os = require('os');
var path = require('path');
var child_process = require('child_process');

module.exports = function(){
    var globalRoot = child_process.execSync('npm root -g').toString().trim();
    var hiipackRoot = path.resolve(__dirname, '..', 'node_modules');
    var hiipackTempRoot = os.tmpdir() + '/hiipack_cache/node_modules';
    var spliter = os.platform().indexOf('win') === 0 ? ';' : ':';

    var NODE_PATH = process.env.NODE_PATH;
    return [
        hiipackRoot,
        globalRoot,
        hiipackTempRoot
    ].join(spliter) + (NODE_PATH ? spliter + NODE_PATH : '');
};