/**
 * @file
 * @author zdying
 */

'use strict';

module.exports = function(req, res, next){
    var url = req.url.replace('__source__', '');

    this.sendFile(req, require('path').join(__dirname, '../source/', url))
};