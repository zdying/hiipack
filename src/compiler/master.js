/**
 * @file
 * @author zdying
 */
var path = require('path');
var child_process = require('child_process');

var cache = {};
var cbk_cache = {};

module.exports = {
    compile: function(project, root, env, option, cbk){
        var root = root || path.resolve('./' + project);
        var cbkId = Math.random();
        var message = {
            project: project,
            root: root,
            option: option,
            env: env,
            date: Date.now(),
            watch: env === 'loc',
            cbk: cbkId
        };

        cbk_cache[cbkId] = cbk;

        if(cache[root]){
            cache[root].cbk = cbk;
            cache[root].send(message);
            return;
        }else{
            log.debug('新建worker...');
        }

        var worker = child_process.fork(__dirname + '/worker', process.argv, {
            cwd: root
        });

        cache[root] = worker;

        var _start = Date.now();

        worker.send(message);

        worker.on('message', function(m){
            if(m.action === 'compiler-finish'){
                // console.log('master receive message:', JSON.stringify(m));
                var now = Date.now();
                // console.log('all finished:', now - _start, 'ms');
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
                // console.log('master receive message:', JSON.stringify(m));
                count++;

                console.log(count + '/' + length);

                if(count === length){
                    var now = Date.now();
                    // console.log('all finished:', now - _start, 'ms', 'avg:', (now - _start) / length);
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

        var worker = child_process.fork(__dirname + '/worker');
        worker.send({
            project: project,
            root: root,
            option: option,
            isDLL: true,
            env: env
        });

        worker.on('message', function(m){
            // console.log('master receive message:', JSON.stringify(m));
            log.info('dll compile finished:', Date.now() - _start, 'ms');
            process.kill(worker.pid);
            cbk && cbk();
        });
    }
};

function publish(data) {
    for (var id in global.clients) {
        global.clients[id].write("data: " + JSON.stringify(data) + "\n\n");
    }
}