/**
 * @file
 * @author zdying
 */
var program = global.program;
var colors = require('colors');

module.exports = {
    debug: function(msg){
        process.env.HIIPACK_DEBUG && printMessage('debug', 'blue', msg)
    },
    access: function(req){
        printMessage('access', 'green', [req.method.bold, req.url, req.res.statusCode])
    },
    error: function(err){
        printMessage('error', 'red', err.message);
        if(process.env.HIIPACK_ERROR_DETAIL){
            printMessage('', 'red', err.stack)
        }
    },
    warn:  function(msg){
        printMessage('warn', 'yellow', msg)
    }
};

function printMessage(group, groupColor, message){
    console.log(('[' + group + ']').bold[groupColor], message.join ? message.join(' ') : message);
}