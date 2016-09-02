/**
 * @file
 * @author zdying
 */
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');

var os = require('os');
var child_process = require('child_process');

var __hiipack__ = require('../src/global');

describe('hiipack cli',function(){
    // try{
    //     fse.copySync(path.resolve(__hiipack__.root, 'tmpl', '_cache'), __hiipack__.tmpdir, function(err){
    //         if(err) console.error(err);
    //     });
    // }catch(e){
    //     console.log(e);
    // }
    //
    // describe('hii',function(){
    //     it('should has no error', function(done){
    //         child_process.exec('node src/hii -h', done);
    //     });
    // });
    //
    // describe('hii init',function(){
    //     it('should has error', function(done){
    //         child_process.exec('node src/hii init', function(err, stdout, stderr){
    //             if(err){
    //                 done()
    //             }else{
    //                 done(false)
    //             }
    //         });
    //     });
    // });
    //
    // describe('hii init normal',function(){
    //     it('should create normal project template', function(done){
    //         child_process.exec('node src/hii init normal', function(err, stdout, stderr){
    //             var _path = path.resolve(__dirname, '..', 'normal');
    //             if(fs.existsSync(_path)){
    //                 fs.unlink(_path);
    //                 done();
    //             }else{
    //                 done(new Error())
    //             }
    //         });
    //     });
    // });
    //
    // child_process.execSync('rm -rdf ../news ../normal')
});