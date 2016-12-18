/**
 * @file
 * @author zdying
 */

var Compiler = require('./_index');

var compiler = null;

var publish = function(data){
    // console.log('publish.....'.red, data);
    process.send({
        action: 'hmr',
        data: data
    })
};

function compile(conf){
    // projectName, root, env
    if(!compiler){
        compiler = new Compiler(conf.project, conf.root, conf.env, publish);
        console.log('【worker】已经缓存compiler: ', conf.root, JSON.stringify(conf));
        conf.watch = false;
        compiler.compileDLL(false, conf, function(){
            console.log('[' + process.pid + ']', 'compile finish');
            // process.send({ret: true});
            compiler.compile(conf, function(){
                console.log('[' + process.pid + ']', 'compile finish');
                process.send({action: 'compiler-finish', cbkId: conf.cbk})
            })
        });
        // console.log(compilers);
    }else{
        console.log('compiler 实例已经创建过...', JSON.stringify(conf));
        // conf.watch = false;
        compiler.compile(conf, function(){
            console.log('[' + process.pid + ']', 'compile finish');
            process.send({action: 'compiler-finish', cbkId: conf.cbk})
        })
    }

    // if(conf.isDLL){
    //     compiler.compileDLL(false, conf, function(){
    //         console.log('[' + process.pid + ']', 'compile finish');
    //         process.send({ret: true})
    //     })
    // }else{
    //     compiler.compile(conf, function(){
    //         console.log('[' + process.pid + ']', 'compile finish');
    //         process.send({ret: true})
    //     })
    // }
}

process.on('message', function(conf){
    var now = Date.now();
    console.info('[' + process.pid + ']', 'child process receive message', now, 'delay:', now - conf.date);

    compile(conf);
});