/**
 * @file
 * @author zdying
 */

'use strict';

var Server = require('./Server');

module.exports = {
    init: function(){

    },

    isCompiling: false,

    /**
     * 启动一个服务
     */
    start: function(port, openBrowser){
        return new Server(port, openBrowser);
    }
};
