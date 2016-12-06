/**
 * @file
 * @author zdying
 */

require('../src/global');
var webpackConfig = require('../src/webpackConfig/index');
var getBabelLoader = require('../src/webpackConfig/utils/getJSLoader');

var assert = require('assert');

describe('getUserConfig: 具体环境配置覆盖基本配置',function(){
    var baseConfig = require(__dirname + '/webpackConfig/project/hii.config');
    var devConfig = require(__dirname + '/webpackConfig/project/hii.config.development');

    var userCofig = webpackConfig.getUserConfig(__dirname + '/webpackConfig/project', 'loc');

    it('正确merge数组', function(){
        assert(userCofig.library.lib.join(',') === devConfig.library.lib.join(','));
    });

    it('正确merge对象', function(){
        assert(!userCofig.entry.main && !userCofig.entry.test && userCofig.entry.main_dev);
    });

    it('正确merge基本类型字段', function(){
        assert(userCofig.supportIE8 === devConfig.supportIE8 && userCofig.thread === devConfig.thread);
    });

    // it('特殊配置不直接merge', function(){
    //     assert(userCofig.autoTest === undefined)
    // })
});