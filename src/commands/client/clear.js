/**
 * @file
 * @author zdying
 */

var fse = require('fs-extra');

module.exports = {
    exec: function(args){
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
