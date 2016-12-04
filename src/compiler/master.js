/**
 * @file
 * @author zdying
 */
var path = require('path');
var child_process = require('child_process');

var Compiler = require('./index');

module.exports = {
    compile: function(project, root, env, option){
        var root = root || path.resolve('./' + project);
        var config = require(root + '/' + 'hii.config');

        var entry = config.entry;
        var length = Object.keys(entry).length;
        var count = 0;
        var _start = Date.now();

        for(var key in entry){
            // console.log('entry========>', key);
            var worker = child_process.fork(__dirname + '/worker');
            worker.send({
                project: project,
                root: root,
                option: option,
                entry: key,
                env: env,
                date: Date.now()
            });

            // console.log('master send message to workder#' + worker.pid, Date.now());

            worker.on('message', function(m){
                console.log('master receive message:', JSON.stringify(m));
                count++;

                console.log(count + '/' + length);

                if(count === length){
                    var now = Date.now();
                    console.log('all finished:', now - _start, 'ms', 'avg:', (now - _start) / length);
                    process.exit(0);
                }
                // process.kill(worker.pid)
            });
        }
    },

    compileDLL: function(project, root, env, option, cbk){
        var root = root || path.resolve('./' + project);
        var config = require(root + '/' + 'hii.config');
        var _start = Date.now();

        console.log('library========>', config.library);
        var worker = child_process.fork(__dirname + '/worker');
        worker.send({
            project: project,
            root: root,
            option: option,
            isDLL: true,
            env: env
        });

        worker.on('message', function(m){
            console.log('master receive message:', JSON.stringify(m));
            console.log('dll compile finished:', Date.now() - _start, 'ms');
            process.kill(worker.pid);
            cbk && cbk();
        });
    },
    compiledddd: function(compiler, env, option, callback){
        var config = compiler.getConfig(env);
        var splitedConfig = compiler.splitConfig(config);

        splitedConfig.forEach(function(conf){
            var worker = child_process.fork(__dirname + '/worker');
            worker.send({
                env: env,
                option: option,
                entry: conf.entry
            });

            worker.on('message', function(m){
                console.log('master receive message:', JSON.stringify(m));
                process.kill(worker.pid)
            });
        });
    },
    watch: function(compiler, cbk){
        var worker = child_process.fork(__dirname + '/worker');
        var ref = {a:1,b:2};

        // worker.send({
        //     test: 'config test',
        //     src: __dirname,
        //     cwd: __hii__.cwd,
        //     num: 1,
        //     string: 'str',
        //     bool: true,
        //     fun: function(){
        //         console.log('abc fun');
        //     },
        //     reg: /aaab/,
        //     ref: ref
        // });
        worker.send({
            compiler: compiler
        });

        worker.on('message', function(m){
            console.log('master receive message:', JSON.stringify(m));
            process.kill(worker.pid)
        });
    },
    run: function(compiler, cbk){
        var worker = child_process.fork(__dirname + '/worker');

        worker.send({
            compiler: compiler
        });

        worker.on('message', function(m){
            console.log('master receive message:', JSON.stringify(m));
            process.kill(worker.pid)
        });
    }
};