/**
 * @file
 * @author zdying
 */

module.exports = {
    exec: function(project){
        var client = require('../../client');
        client.local(project);
    },

    usage: function(){
        return "hiipack local [option]";
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
