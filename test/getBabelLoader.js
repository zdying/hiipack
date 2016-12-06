/**
 * @file
 * @author zdying
 */

require('../src/global');
var webpackConfig = require('../src/webpackConfig/index');
var getBabelLoader = require('../src/webpackConfig/utils/getJSLoader');

var assert = require('assert');

describe('getBabelLoader',function(){
    var baseConfig = require(__dirname + '/webpackConfig/project/hii.config');
    var devConfig = require(__dirname + '/webpackConfig/project/hii.config.development');

    var userCofig = webpackConfig.getUserConfig(__dirname + '/webpackConfig/project', 'loc');
    var userCofigBeta = webpackConfig.getUserConfig(__dirname + '/webpackConfig/project', 'dev');

    describe('默认配置:', function(){
        var babelLoader = getBabelLoader(userCofig, 'loc');

        it('getBabelLoader -> query.preset 正确', function(){
            // hii.config.development.js中 supportIE8=false
            var ok = (babelLoader.query.presets.join(',') === [
                'babel-preset-react',
                'babel-preset-es2015'
            ].map(__hiipack__.resolve).join(','));
            assert(ok)
        });

        it('getBabelLoader -> query.plugins 正确', function(){
            var ok = (babelLoader.query.plugins.join(',') === [
                // es6 export
                'babel-plugin-add-module-exports',
                // export default
                'babel-plugin-transform-export-extensions',
                // {...}语法
                'babel-plugin-transform-object-rest-spread',
                // Object.assign
                'babel-plugin-transform-object-assign'
            ].map(__hiipack__.resolve).join(','));

            assert(ok)
        });

        it('getBabelLoader -> include 正确', function(){
            var ok = babelLoader.include === '';
            assert(ok)
        });

        it('getBabelLoader -> exclude 正确', function(){
            var ok = babelLoader.exclude.toString() === /(node_modules|bower_components)/.toString();
            assert(ok)
        });
    });

    describe('覆盖配置:', function(){
        var babelLoader = getBabelLoader(userCofigBeta, 'dev');
        it('getBabelLoader -> query.preset 正确', function(){
            var ok = (babelLoader.query.presets.join(',') === [
                'babel-preset-react',
                'babel-preset-es2015-loose'
            ].map(__hiipack__.resolve).join(','));
            assert(ok)
        });

        it('getBabelLoader -> query.plugins 正确', function(){
            var ok = (babelLoader.query.plugins.join(',') === [
                'babel-plugin-add-module-exports',
                'babel-plugin-transform-object-assign'
            ].map(__hiipack__.resolve).join(','));

            assert(ok)
        });

        it('getBabelLoader -> include 正确', function(){
            var ok = babelLoader.include.join(',') === ['src', 'app'].join(',');
            assert(ok)
        });

        it('getBabelLoader -> exclude 正确', function(){
            var ok = babelLoader.exclude.toString() === /^(lib|test)$/.toString();
            assert(ok)
        });
    });
});