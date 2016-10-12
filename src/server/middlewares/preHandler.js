/**
 * @file 请求预处理
 * @author zdying
 */

'use strict';

module.exports = function(req, res, next){
    req.url = req.url.replace(/[\?\#].*$/, '');
    req._startTime = Date.now();
    log.debug('request -', req.url);
    next();
};