/**
 * @file
 * @author zdying
 */

module.exports = {
    exec: function(name, type, registry){
        var client = require('../../client');
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
