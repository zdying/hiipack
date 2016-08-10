#!/usr/bin/env node
var express = require('express');
var path = require('path');
var fs = require('fs');
var colors = require('colors');
var program = require('commander');
var child_process = require('child_process');

var server = require('./server');
var client = require('./client');
var package = require('../package.json');

global.__hiipack_root__ = path.resolve(__dirname, '..');
global.__hiipack_cwd__ = process.cwd();

// console.log('__hiipack_root__'.bold.magenta, '==>', __hiipack_root__);
// console.log('__hiipack-cwd__ '.bold.magenta, '==>', __hiipack_cwd__);

program
    .version(package.version)
    // .option('-v, --version', '版本信息')
    .option('-o, --open', 'open browser')
    .option('-p, --port <port>', 'server port', 8800)
    .option('-r, --registry <registry>', 'npm registry')
    //TODO impl next version
    // .option('-w, --workspace <workspace>', 'workspace', process.cwd())
    .option('-t, --type <type>', 'project type', /^(react|react-redux|es6|normal)$/, 'normal');

program
    .command('init <name>')
    .description('初始化一个项目')
    .action(function(name){
        client.init(name, program.type, program.registry);
    });

program
    .command('start')
    .description('创建本地服务器')
    .action(function(){
        server.start(program.port, program.open);
    });

program
    .command('min')
    .description('压缩/混淆项目文件')
    .action(function(){
        client.build();
    });

program
    .command('pack')
    .description('合并项目文件')
    .action(function(){
        client.pack();
    });

program
    .command('sync')
    .description('同步/上传当前目录至远程服务器')
    .action(function(){
        client.sync();
    });

program
    .command('clear')
    .description('清除hiipack生成的文件夹')
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
});

program.parse(process.argv);

if(process.argv.length == 2){
    showVersion();
}

function showVersion(){
    console.log('hiipack\t'.bold, package.version.magenta);
    console.log('author\t', 'zdying'.yellow.bold);
}