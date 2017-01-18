/**
 * @file
 * @author zdying
 */
var path = require('path');
var child_process = require('child_process');
var Compiler = require('./Compiler');

var cache = {};
var cbk_cache = {};
var compiler = {
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
            cbk: cbkId,
            originCwd: __hii__.cwd
        };

        cbk_cache[cbkId] = cbk;

        if(cache[root]){
            log.debug('use old worker:', root);

            if(cache[root].connected){
                cache[root].send(message);
            }else{
                var error = new Error('Channel Closed');
                error.code = 'CHANNEL_CLOSED';
                cbk(new Error())
            }
            return;
        }else{
            log.debug('create new worker');
        }

        log.debug('fork new worker:', __dirname + '/worker.js');
        log.debug('new worker root:', root);

        var worker = child_process.fork(__dirname + '/worker.js', process.argv.slice(2), {
            cwd: root,
            execArgv: []
        });

        worker.on('error', function(err){
            cache[root].disconnect();
            log.error(err);
            cbk(err);
            delete cbk_cache[cbkId]
        });

        cache[root] = worker;

        worker.send(message);

        worker.on('message', function(m){
            if(m.action === 'compiler-finish'){
                var cbkId = m.cbkId;
                if(cbk_cache[cbkId]){
                    cbk_cache[cbkId]();
                    delete cbk_cache[cbkId];
                }
                // process.exit(0);
            }else if(m.action === 'hmr'){
                publish(m.data);
            }
        });
    }
};

"compileSASS compileLESS".split(' ').forEach(function(method){
    compiler[method] = Compiler[method];
});

function publish(data) {
    for (var id in global.clients) {
        global.clients[id].write("data: " + JSON.stringify(data) + "\n\n");
    }
}

module.exports = compiler;