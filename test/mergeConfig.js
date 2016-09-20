/**
 * @file
 * @author zdying
 */

require('../src/global');
var webpackConfig = require('../src/webpackConfig/index');
var locConfig = require('../src/webpackConfig/loc/config');

var assert = require('assert');

describe('mergeConfig: ',function(){
    var userCofig = webpackConfig.getUserConfig(__dirname + '/webpackConfig/project', 'loc');

    // 删除 dll
    delete userCofig.library;

    var locConf = locConfig(__dirname + '/webpackConfig/project', userCofig);

    it('正确扩展plugins', function(){
        var plugins = locConf.plugins;

        // loc 默认一个插件, 配置文件中有三个插件
        assert(plugins.length === 4);

        //TODO 进一步验证插件内容是否正确
    });

    it('正确扩展loaders', function(){
        var loaders = locConf.module.loaders;
        var exists = false;
        var testOk, loaderOk;
        for(var i = 0, len = loaders.length; i < len; i++){
            /* 配置文件中增加了一个:
             * {
             *    'mustache mustache-loader': function(loader, path){
             *        return { test: /\.(mustache|html)$/, loader: 'mustache' }
             *    }
             * }
             */
            testOk = loaders[i].test.toString() === /\.(mustache|html)$/.toString();
            loaderOk = loaders[i].loader === 'mustache';

            if(testOk && loaderOk){
                exists = true;
                break;
            }
        }
        assert(exists);
    });

    it('特殊配置不直接扩展', function(){
        assert(locConf.autoTest === undefined)
    })
});