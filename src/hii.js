/**
 * @file
 * @author zdying
 */
var __hiipack = require('./global');
var colors = require('colors');

// console.log(process.env.NODE_PATH);

var package = require('../package.json');
var program = global.program;

var exec = require('./commands').exec;

// console.log('__hiipack__.root'.bold.magenta, '==>', __hiipack_root__);
// console.log('__hiipack__.cwd '.bold.magenta, '==>', __hiipack_cwd__);
// console.log(process.env.NODE_PATH);

program
    .version(package.version, '-v, --version')
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

program
    .command('init <name>')
    .description('initialize project')
    .action(function(name){
        exec('init', name, program.type, program.registry);
        // client.init(name, program.type, program.registry);
    });

program
    .command('start')
    .description('create a local server')
    .action(function(){
        var browser = false;

        if(program.open){
            browser = typeof program.open === 'string' ? program.open : 'chrome';
        }

        process.stdout.write('\u001B[2J\u001B[0;0f');

        showVersion();

        exec('start', program.port, browser, program.proxy);
    });

program
    .command('min')
    .description('compress/uglify project files')
    .action(function(){
        showVersion();
        exec('min');
    });

program
    .command('pack')
    .description('pack project files')
    .action(function(){
        showVersion();
        exec('pack');
    });

program
    .command('local <project>')
    .description('pack local project files')
    .action(function(project){
        exec('local', project);
    });

program
    .command('sync')
    .description('synchronize the current directory to remote server')
    .action(function(){
        exec('sync', program.syncConf);
        // client.sync(program.syncConf);
    });

program
    .command('test')
    .description('run unit test')
    .action(function(){
        exec('test');
    });

program
    .command('clear')
    .description('clear resulting folders of hiipack')
    .action(function(){
        exec('clear');
    });

program
    .command('config [operation] [args...]')
    .description('hiipack config, `operation`: [empty]|list|set|delete')
    .action(function(ope, args, options){
        // client.config(ope, args)
        exec('config', ope, args);
    });

program
    .command('ssl')
    .description('show ssl certificate file path.')
    .action(function(){
        exec('ssl');
    });

program.on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ hii init project_name');
    console.log('    $ hii start');
    console.log('    $ hii start -p 8800');
    console.log('    $ hii pack');
    console.log('    $ hii sync');
    console.log('    $ hii min');
    console.log('');
    console.log('  Wiki:');
    console.log('');
    console.log('    https://github.com/zdying/hiipack/wiki/hiipack-%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E');
});

program.parse(process.argv);

if(process.argv.length == 2){
    showVersion();
}

function showVersion(){
    var version = package.version.magenta;

    console.log("");
    console.log("                ,-.");
    console.log("      _,.      /  /");
    console.log("     ; \\____,-==-._  )     " + "hiipack".bold + "/" + version);
    console.log("     //_    `----' {+>     " + "zdying@live.com".bold.yellow);
    console.log("     `  `'--/  /-'`(       " + "github.com\/zdying".green.underline);
    console.log("           /  /");
    console.log("           `='");
    console.log("");
}
