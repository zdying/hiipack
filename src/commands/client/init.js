/**
 * @file
 * @author zdying
 */

var client = require('../../client');

module.exports = {
    exec: function(name, type, registry){
        client.init(name, type, registry);
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
