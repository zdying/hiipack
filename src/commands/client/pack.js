/**
 * @file
 * @author zdying
 */

module.exports = {
    exec: function(args){
        var client = require('../../client');
        client.pack();
    },

    usage: function(){
        return "hiipack pack [option]";
    },

    options: function(){
        return [
            '-d, --debug',
            '-D, --detail',
            '--no-color',
            '--no-hot-reload'
        ]
    },

    help: function(){
        return null;
    }
}
