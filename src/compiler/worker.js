/**
 * @file
 * @author zdying
 */

var Compiler = require('./Compiler');

var compiler = null;

var publish = function(data){
    process.send({
        action: 'hmr',
        data: data
    })
};

function compile(conf){
    // projectName, root, env
    if(!compiler){
        compiler = new Compiler(conf.project, conf.root, conf.env, publish);
    }else{
    }

    compiler.compileDLL(false, conf, function(){
        log.info('[' + process.pid + ']', 'dll compile finish');
        compiler.compile(conf, function(){
            log.info('[' + process.pid + ']', 'compile finish');
            process.send({action: 'compiler-finish', cbkId: conf.cbk})
        })
    });
}

process.on('message', function(conf){
    var now = Date.now();

    log.debug('[' + process.pid + ']', 'child process receive message', now, 'delay:', now - conf.date);

    compile(conf);
});