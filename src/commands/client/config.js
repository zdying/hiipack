/**
 * @file
 * @author zdying
 */

var client = require('../../client');

module.exports = {
    exec: function(ope, args){
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
