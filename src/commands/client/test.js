/**
 * @file
 * @author zdying
 */

module.exports = {
    exec: function(args){
        var client = require('../../client');
        client.test();
    },

    usage: function(){
        return "hiipack test";
    },

    help: function(){
        return null;
    }
}
