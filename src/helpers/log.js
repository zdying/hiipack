/**
 * @file
 * @author zdying
 */

var colors = require('colors');

module.exports = {
    debug: function(){
        program.debug && printMessage('debug', 'magenta', arguments)
    },
    access: function(req){
        var statusCode = req.res.statusCode;
        var colormap = {
            404: 'yellow',
            500: 'red',
            304: 'green',
            200: 'white'
        };
        var time = Date.now() - req._startTime;

        printMessage('access', 'grey', [
            req.method.bold.grey,
            req.url.grey,
            String(statusCode)[colormap[statusCode] || 'grey'],
            ('(' + time + 'ms' + ')')[time >= 2000 ? 'yellow' : 'grey']
        ])
    },
    error: function(err){
        if(program.error){
            var type = Object.prototype.toString.call(err);

            if(type === '[object Error]'){
                printMessage('error', 'red', err.message);
                if(program.errorDetail){
                    printMessage('', 'red', err.stack)
                }
            }else{
                printMessage('error', 'red', arguments)
            }
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
