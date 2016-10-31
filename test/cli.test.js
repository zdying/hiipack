/**
 * @file
 * @author zdying
 */
var assert = require('assert');
var path = require('path');
var fs = require('fs');

var os = require('os');
var child_process = require('child_process');

var __hiipack__ = require('../src/global');

describe('hiipack cli',function(){

    describe('hii',function(){
        it('should has no error', function(done){
            child_process.exec('node src/hii -h', done);
        });
    });

    describe('hii init',function(){
        it('should has error', function(done){
            child_process.exec('node src/hii init', function(err, stdout, stderr){
                if(err){
                    done()
                }else{
                    done(false)
                }
            });
        });
    });

    describe('hii init normal project',function(){
        it('should create normal project template', function(done){
            child_process.exec('node src/hii init normal', function(err, stdout, stderr){
                var _path = path.resolve(__dirname, '..', 'normal');
                if(fs.existsSync(_path)){
                    done();
                }else{
                    done(new Error())
                }
            });
        });
    });

    describe('hii init vue project',function(){
        it('should create vue project template', function(done){
            child_process.exec('node src/hii init vue-todo -t vue', function(err, stdout, stderr){
                var _path = path.resolve(__dirname, '..', 'vue-todo');
                if(fs.existsSync(_path)){
                    done();
                }else{
                    done(new Error())
                }
            });
        });
    });
});