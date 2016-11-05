/**
 * @file
 * @author zdying
 */

var server = require('../../server');

module.exports = {
    exec: function(port, browser, proxy){
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
