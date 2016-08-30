/**
 * @file 获取配置
 * @author zdying
 */

var configFunc = require('./prd/config');
var dllConfigFunc = require('./prd/config.dll');

var configDevFunc = require('./dev/config');
var dllConfigDevFunc = require('./dev/config.dll');

var configLocFunc = require('./loc/config');
var dllConfigLocFunc = require('./loc/config.dll');

var common = require('./common');

module.exports = {
    // 线上环境配置
    getPrdConfig: configFunc,
    getPrdDLLConfig: dllConfigFunc,

    // beta环境配置
    getDevConfig: configDevFunc,
    getDevDLLConfig: dllConfigDevFunc,

    // 本地开发调试环境
    getLocConfig: configLocFunc,
    getLocDLLConfig: dllConfigLocFunc,

    getUserConfig: common.getUserConfig
};
