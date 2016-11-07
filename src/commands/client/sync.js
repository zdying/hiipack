/**
 * @file
 * @author zdying
 */

var client = require('../../client');

module.exports = {
    exec: function(syncConf){
        client.sync(syncConf);
    },

    usage: function(){
        return "hiipack sync [option]";
    },

    options: function(){
        return [
            '-s, --sync-config'
        ]
    },

    help: function(){
        return null;
    }
}
