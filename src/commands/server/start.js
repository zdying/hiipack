/**
 * @file
 * @author zdying
 */

module.exports = {
    exec: function(port, browser, proxy){
        var server = require('../../server');
        server.start(port, browser, proxy);
    },

    usage: function(){
        return "hiipack init <name> [-t <type>]";
    },

    options: function(){
        return [
            '-t, --type'
        ]
    },

    help: function(){
        return null;
    }
}
