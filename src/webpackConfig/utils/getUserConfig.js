/**
 * @file
 * @author zdying
 */

var colors = require('colors');
var extend = require('extend');

/**
 * 获取用户配置, 会将用户根目录下的基本配置(`hii.config.js`)和特定环境下的配置(比如`hii.config.production.js`)合并
 * 特定环境配置的字段优先级高于基本配置字段
 * @param root
 * @param env
 * @returns {*}
 */
module.exports = function getUserConfig(root, env){
    var map = {
        'loc': 'development',
        'dev': 'beta',
        'prd': 'production'
    };
    var baseConfig = require(root + '/hii.config');
    var envConfig = {};
    try{
        envConfig = require(root + '/hii.config.' + map[env]);
        log.debug('merge', ('`hii.config.' + map[env] + '.js`').bold.green, 'to', '`hii.config.js`'.bold.green);
        return extend(true, {}, baseConfig, envConfig)
    }catch(e){
        log.debug(('`hii.config.' + map[env] + '.js`').bold.yellow, 'not exists, return', '`hii.config.js`'.bold.green);
        return baseConfig
    }
};