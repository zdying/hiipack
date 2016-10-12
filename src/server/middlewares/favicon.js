/**
 * @file
 * @author zdying
 */

'use strict';

var path = require('path');

module.exports = function(req, res, next){
    this.sendFile(req, path.resolve(__dirname, '../source/favicon.ico'));
};