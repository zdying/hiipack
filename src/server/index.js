/**
 * @file
 * @author zdying
 */

'use strict';
var fs = require('fs');
var Server = require('./Server');

module.exports = {
    init: function(){

    },

    /**
     * 启动一个服务
     */
    start: function(port, openBrowser, proxy){
        if(fs.existsSync(__hii__.cwd + '/hii.config.js')){
            console.log('');
            log.warn(__hii__.cwd.bold.yellow , 'looks like a hiipack project, try starting the service from the parent.');
            console.log('');
        }

        return new Server(port, openBrowser, proxy);
    }
};
