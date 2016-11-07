/**
 * @file
 * @author zdying
 */

var client = require('../../client');

module.exports = {
    exec: function(args){
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
