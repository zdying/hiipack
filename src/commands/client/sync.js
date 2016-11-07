/**
 * @file
 * @author zdying
 */

module.exports = {
    exec: function(syncConf){
        var client = require('../../client');
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
