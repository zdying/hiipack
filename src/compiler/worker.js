/**
 * @file
 * @author zdying
 */
var Compiler = require('./Compiler');
var _global = require('../global');

program
    .option('-o, --open [open]', 'open in browser, one of: chrome|firefox|safari|opera', /^(chrome|firefox|safari|opera)$/)
    .option('-p, --port <port>', 'service port', 8800)
    .option('-r, --registry <registry>', 'npm registry address')
    .option('-d, --debug', 'print debug log')
    .option('-s, --sync-conf <syncConf>', 'custom sync config')
    //TODO add this next version
    // .option('-U, --uglify', 'uglify javascript')
    //TODO add this next version
    // .option('-e, --extract-css', 'extract css from javascript')
    .option('-D, --detail', 'print debug and error detail log')
    // .option('-w, --workspace <workspace>', 'workspace', process.cwd())
    .option('-x, --proxy', 'start the proxy server')
    .option('-t, --type <type>', 'project type: one of react|react-redux|es6|vue|normal|empty', /^(react|react-redux|es6|vue|normal|empty)$/, 'normal')
    .option('--no-color', 'disable log color')
    .option('--no-hot-reload', 'disable hot reload')
    .option('--log-time', 'display log time')
    .option('--https', 'start https server')
    .option('--ssl-key <sslKey>', 'ssl key file')
    .option('--ssl-cert <sslCert>', 'ssl cert file');

program.parse(process.argv);

var compiler = null;

var publish = function(data){
    process.send({
        action: 'hmr',
        data: data
    })
};

console.log('afafasfasfa');

function compile(conf){
    // projectName, root, env
    if(!compiler){
        compiler = new Compiler(conf.project, conf.root, conf.env, publish);
    }else{
    }

    // compiler.compileDLL(false, conf, function(err){
    //     log.info('[' + process.pid + ']', 'dll compile finish', err);
    //     compiler.compile(conf, function(err, stat){
    //         log.info('[' + process.pid + ']', 'compile finish', err, stat);
    //         process.send({action: 'compiler-finish', cbkId: conf.cbk})
    //     })
    // });
    compiler.compile(conf, function(err, stat){
        log.info('[' + process.pid + ']', 'compile finish', err, stat);
        process.send({action: 'compiler-finish', cbkId: conf.cbk})
    })
}

process.on('message', function(conf){
    var now = Date.now();

    __hii__.originCwd = conf.originCwd;

    log.debug('[' + process.pid + ']', 'child process receive message', now, 'delay:', now - conf.date);

    compile(conf);
});