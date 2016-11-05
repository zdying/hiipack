/**
 * @file
 * @author zdying
 */

var client = require('../../client');

module.exports = {
    exec: function(args){
        client.test();
    },

    usage: function(){
        return "hiipack test";
    },

    help: function(){
        return null;
    }
}
