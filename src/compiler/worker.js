/**
 * @file
 * @author zdying
 */

var Compiler = require('./_index');

function compile(conf){
    // projectName, root, env
    var compiler = new Compiler(conf.project, conf.root, conf.env);

    if(conf.isDLL){
        compiler.compileDLL(false, conf, function(){
            console.log('[' + process.pid + ']', 'compile finish');
            process.send({ret: true})
        })
    }else{
        compiler.compile(conf, function(){
            console.log('[' + process.pid + ']', 'compile finish');
            process.send({ret: true})
        })
    }
}

process.on('message', function(conf){
    var now = Date.now();
    console.info('[' + process.pid + ']', 'child process receive message', now, 'delay:', now - conf.date);
    compile(conf);
});