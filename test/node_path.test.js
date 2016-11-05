/**
 * @file
 * @author zdying
 */
var assert = require('assert');
var path = require('path');

var os = require('os');
var child_process = require('child_process');

// var globalRoot = child_process.execSync('npm root -g').toString().trim();
var hiipackRoot = path.resolve(__dirname, '..', 'node_modules');
var hiipackTempRoot = os.tmpdir() + '/hiipack_cache/node_modules';

describe('NODE_PATH',function(){
    var nodepath = require('../src/node_path')();
    it('NODE_PATH should include hiipack root',function(){
        assert(nodepath.indexOf(hiipackRoot) !== -1)
    });

    it('NODE_PATH should include hiipack tmpdir',function(){
        assert(nodepath.indexOf(hiipackTempRoot) !== -1)
    });

    // it('NODE_PATH should include global root',function(){
    //     assert(nodepath.indexOf(globalRoot) !== -1)
    // });
});
