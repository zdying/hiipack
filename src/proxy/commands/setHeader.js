/**
 * @file
 * @author zdying
 */
'use strict';

module.exports = function setHeader(response, key, val){
    if(typeof response.setHeader === 'function'){
        response.setHeader(key, val);
    }else{
        response.headers = response.headers || {};
        response.headers[key] = val;
    }
};