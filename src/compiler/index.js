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
            cache[root].send(message);
            return;
        }else{
            log.debug('create new worker...');
        }

        var worker = child_process.fork(__dirname + '/worker', process.argv.slice(2), {
            cwd: root,
            execArgv: []
        });

        cache[root] = worker;

        var _start = Date.now();

        worker.send(message);

        worker.on('message', function(m){
            if(m.action === 'compiler-finish'){
                if(cbk_cache[m.cbkId]){
                    cbk_cache[m.cbkId]();
                    delete cbk_cache[m.cbkId];
                }
                // process.exit(0);
            }else if(m.action === 'hmr'){
                publish(m.data);
            }
        });
    }
};

function publish(data) {
    for (var id in global.clients) {
        global.clients[id].write("data: " + JSON.stringify(data) + "\n\n");
    }
}