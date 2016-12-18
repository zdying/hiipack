/**
 * @file
 * @author zdying
 */
var path = require('path');
var child_process = require('child_process');

var Compiler = require('./_index');

var cache = {};
var cbk_cache = {};

module.exports = {
    compile: function(project, root, env, option, cbk){
        var root = root || path.resolve('./' + project);
        var message = {
            project: project,
            root: root,
            option: option,
            env: env,
            date: Date.now(),
            watch: env === 'loc',
            cbk: cbk.cbkId
        };

        cbk_cache[cbk.cbkId] = cbk;

        if(cache[root]){
            console.log('worker已经存在: cbk.id', cbk.cbkId, cache[root].pid);
            cache[root].cbk = cbk;
            cache[root].send(message);
            return;
        }else{
            console.log('新建worker cbk.id', cbk.cbkId);
        }

        var worker = child_process.fork(__dirname + '/worker', process.argv, {
            cwd: root
        });

        cache[root] = worker;

        worker.cbk = cbk;

        var _start = Date.now();

        console.log('master send message ..........................', worker.pid);

        worker.send(message);


        worker.on('message', function(m){
            if(m.action === 'compiler-finish'){
                console.log('master receive message:', JSON.stringify(m));
                var now = Date.now();
                console.log('all finished:', now - _start, 'ms');
                if(cbk_cache[m.cbkId]){
                    cbk_cache[m.cbkId]();
                    delete cbk_cache[m.cbkId];
                }
                // process.exit(0);
            }else if(m.action === 'hmr'){
                publish(m.data);
            }
        });
    },

    compileEveryEntry: function(project, root, env, option){
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

        console.log('====>=====>===========>',project, root, env);


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
            console.log('执行cbk...', cbk.cbkId);
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

function publish(data) {
    for (var id in global.clients) {
        global.clients[id].write("data: " + JSON.stringify(data) + "\n\n");
    }
}