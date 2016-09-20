/**
 * @file
 * @author zdying
 */

var Compiler = require('./index');

function compile(m){
    var compiler = new Compiler(m.project, m.workPath);

    compiler.compile(m.env, m, function(){
        console.log('[' + process.pid + ']', 'compile finish');
        process.send({ret: true})
    })
}

process.on('message', function(m){
    console.log('[' + process.pid + ']', 'child process receive message');
    compile(m);
});