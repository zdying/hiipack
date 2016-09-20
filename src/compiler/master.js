/**
 * @file
 * @author zdying
 */
var path = require('path');
var child_process = require('child_process');

var Compiler = require('./index');

module.exports = {
    compile: function(option){
        var root = option.workPath || path.resolve('./' + option.project);
        var config = require(root + '/' + 'hii.config');

        var entry = config.entry;
        var length = Object.keys(entry).length;
        var count = 0;
        var _start = Date.now();

        var compiler = new Compiler(option.project, root);

        for(var key in entry){
            var worker = child_process.fork(__dirname + '/worker');
            var tmp = {};
            tmp[key] = entry[key];
            option.entry = tmp;
            worker.send(option);

            worker.on('message', function(m){
                console.log('master receive message:', JSON.stringify(m));
                count++;

                console.log(count + '/' + length);

                if(count === length){
                    console.log('all finished:', Date.now() - _start, 'ms');
                }
                // process.kill(worker.pid);
            });
        }
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