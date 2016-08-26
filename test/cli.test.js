/**
 * @file
 * @author zdying
 */
var assert = require('assert');
var path = require('path');
var fs = require('fs');

var os = require('os');
var child_process = require('child_process');

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

    describe('hii init normal',function(){
        it('should create normal project template', function(done){
            child_process.exec('node src/hii init normal', function(err, stdout, stderr){
                var _path = path.resolve(__dirname, '..', 'normal');
                if(fs.existsSync(_path)){
                    child_process.execSync('rm -rdf normal');
                    done();
                }else{
                    done(new Error())
                }
            });
        });
    });

    describe('hii init news -t react-redux',function(){
        it('should create react-redux project template', function(done){
            child_process.exec('node src/hii init news -t react-redux', function(err, stdout, stderr){
                var _path = path.resolve(__dirname, '..', 'news');
                if(fs.existsSync(_path)){
                    child_process.execSync('rm -rdf news');
                    done();
                }else{
                    done(new Error())
                }
            });
        });
    });


});