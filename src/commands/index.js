/**
 * @file
 * @author zdying
 */

var cmds = {
    /********** CLIENT **********/
    'init'   : './client/init',
    'pack'   : './client/pack',
    'min'    : './client/min',
    'clear'  : './client/clear',
    'ssl'    : './client/ssl',
    'test'   : './client/test',
    'config' : './client/config',
    'sync'   : './client/sync',

    /********** SERVER **********/
    'start'  : './server/start'
};

module.exports = {
    exec: function(cmd){
        var path = cmds[cmd];
        var args = [].slice.call(arguments, 1);
        var mod = null;
        var exec = null;

        if(typeof path === 'string'){
            try{
                mod = require(path);
                exec = mod.exec;

                if(typeof exec === 'function'){
                    exec.apply(exec, args);
                }else{
                    throw "the module " + require('path').resolve(path) + ' is not a valid command.'
                }
            }catch(err){
                console.log(('[error] ' + cmd + ' exec failed.').bold.red, err.stack);
            }
        }else{
            console.log(('[error] ' + cmd + ' does not exists.').bold.red);
        }
    }
};
