/**
 * @file
 * @author zdying
 */
var program = global.program;
var colors = require('colors');

module.exports = {
    debug: function(){
        process.env.HIIPACK_DEBUG && printMessage('debug', 'blue', arguments)
    },
    access: function(req){
        printMessage('access', 'green', [req.method.bold, req.url, req.res.statusCode])
    },
    error: function(err){
        var type = Object.prototype.toString.call(err);

        if(type === '[object Error]'){
            printMessage('error', 'red', err.message);
            if(process.env.HIIPACK_ERROR_DETAIL){
                printMessage('', 'red', err.stack)
            }
        }else{
            printMessage('error', 'red', arguments)
        }
    },
    warn: function(){
        printMessage('warn', 'yellow', arguments)
    },
    info: function(){
        printMessage('info', 'magenta', arguments)
    }
};

function printMessage(group, groupColor, message){
    if(typeof message === 'object'){
        message = Array.prototype.join.call(message, ' ')
    }
    console.log((group ? ('[' + group + '] ').bold[groupColor] : '') + message);
}
