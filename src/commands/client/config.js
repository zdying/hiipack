/**
 * @file
 * @author zdying
 */

module.exports = {
    exec: function(ope, args){
        var client = require('../../client');
        client.config(ope, args);
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
