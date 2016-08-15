#!/usr/bin/env node
var express = require('express');
var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var colors = require('colors');
var program = require('commander');
var child_process = require('child_process');
var os = require('os');

var server = require('./server');
var client = require('./client');
var package = require('../package.json');

global.__hiipack__ = {
    root: path.resolve(__dirname, '..'),
    cwd: process.cwd(),
    tmpdir: os.tmpdir() + '/hiipack_cache/',
    resolve: function(module){
        if(!module){
            throw Error('module should not be empty.');
        }

        var modulePath = '/node_modules/' + module;
        var dirs = [this.cwd, this.root, this.tmpdir];
        var finalPath = '';

        dirs.forEach(function(dir){
            if(!finalPath){
                try{
                    var stat = fs.statSync(dir + modulePath);

                    if(stat.isDirectory()){
                        finalPath = dir + modulePath;
                    }
                }catch(e){
                    // throw Error('Can\'t find module:' + modulePath)
                }
            }
        });

        finalPath = finalPath || (this.tmpdir + modulePath);
        console.log('[resolve]'.green, module ,'==>', finalPath);
        return finalPath
    }
};

try{
    fse.copy(path.resolve(__hiipack__.root, 'tmpl', '_cache'), __hiipack__.tmpdir, function(err){
        if(err) console.error(err);
    });
}catch(e){

}

// console.log('__hiipack__.root'.bold.magenta, '==>', __hiipack_root__);
// console.log('__hiipack__.cwd '.bold.magenta, '==>', __hiipack_cwd__);

program
    .version(package.version)
    // .option('-v, --version', '版本信息')
    .option('-o, --open', 'open in browser')
    .option('-p, --port <port>', 'service port', 8800)
    .option('-r, --registry <registry>', 'npm registry address')
    //TODO impl next version
    // .option('-w, --workspace <workspace>', 'workspace', process.cwd())
    .option('-t, --type <type>', 'project type: one of react|react-redux|es6|vue|normal|empty', /^(react|react-redux|es6|vue|normal|empty)$/, 'normal');

program
    .command('init <name>')
    .description('initialize project')
    .action(function(name){
        client.init(name, program.type, program.registry);
    });

program
    .command('start')
    .description('create a local server')
    .action(function(){
        server.start(program.port, program.open);
    });

program
    .command('min')
    .description('compress/obfuscate project files')
    .action(function(){
        client.build();
    });

program
    .command('pack')
    .description('pack project files')
    .action(function(){
        client.pack();
    });

program
    .command('sync')
    .description('synchronize the current directory to remote server')
    .action(function(){
        client.sync();
    });

program
    .command('test')
    .description('run unit test')
    .action(function(){
        client.test();
    });

program
    .command('clear')
    .description('clear resulting folders of hiipack')
    .action(function(){
        child_process.exec('rm -rdf dll loc dev prd ver')
    });

program.on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ hii init project_name');
    console.log('    $ hii start');
    console.log('    $ hii start -p 8800');
    console.log('    $ hii pack');
    console.log('    $ hii sync');
    console.log('    $ hii min');
    console.log('');
    console.log('  Wiki:');
    console.log('');
    console.log('    https://github.com/zdying/hiipack/wiki/hiipack-%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E');
});

program.parse(process.argv);

if(process.argv.length == 2){
    showVersion();
}

function showVersion(){
    console.log('hiipack\t'.bold, package.version.magenta);
    console.log('author\t', 'zdying@live.com'.yellow.bold);
}
