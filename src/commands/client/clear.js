/**
 * @file
 * @author zdying
 */

module.exports = {
    exec: function(args){
        var fse = require('fs-extra');

        "dev prd ver loc dll".split(' ').forEach(function(folder){
            fse.remove(folder);
        });
    },

    usage: function(){
        return "hiipack clear";
    },

    help: function(){
        return null;
    }
}
