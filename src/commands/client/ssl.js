/**
 * @file
 * @author zdying
 */

module.exports = {
    exec: function(args){
        console.log(require('path').resolve(__dirname, '../ssl/'));
    },

    usage: function(){
        return "hiipack ssl";
    },

    help: function(){

    }
}
