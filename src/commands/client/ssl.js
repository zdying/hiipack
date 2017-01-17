/**
 * @file
 * @author zdying
 */

module.exports = {
    exec: function(ope, args){
        var ssl = require('../../client/ssl');

        if(typeof ssl[ope] === 'function'){
            ssl[ope].apply(ssl, args);
        }
    },

    usage: function(){
        return "hiipack ssl";
    },

    help: function(){

    }
}
