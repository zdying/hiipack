/**
 * @file 全局对象
 * @author zdying
 */
var path = require('path');
var fs = require('fs');
var colors = require('colors');
var child_process = require('child_process');
var os = require('os');
var log = require('./helpers/log');
var program = require('commander');

var __hiipack__ = {
    /**
     * 全局模块跟目录
     */
    globalRoot: child_process.execSync('npm root -g').toString().trim(),
    /**
     * hiipack根目录
     */
    root: path.resolve(__dirname, '..'),
    /**
     * 当前工作目录
     */
    cwd: process.cwd(),
    /**
     * hiipack存放依赖的临时目录
     */
    tmpdir: os.tmpdir() + '/hiipack_cache',
    /**
     * 查找模块路径, 模块查找顺序: cwd > root > globalRoot > tmpdir
     * 用户可以安装依赖到自己的前端项目中, 如果前端项目中没有指定的依赖, 则去root和globalRoot中查找,
     * 如果没有找到, 会认为模块存在于tmpdir中
     *
     * @param {String} module 模块名称
     * @returns {string}
     */
    resolve: function(module){
        if(!module){
            throw Error('module should not be empty.');
        }

        var modulePath = '/node_modules/' + module;
        var dirs = [this.cwd, this.root, this.globalRoot, this.tmpdir];
        var finalPath = '';

        dirs.forEach(function(dir){
            if(!finalPath){
                try{
                    var stat = fs.statSync(dir + modulePath);

                    if(stat.isDirectory()){
                        finalPath = dir + modulePath;
                    }
                }catch(e){
                    // throw Error('Can\'t find module:' + modulePath)
                }
            }
        });

        finalPath = finalPath || (this.tmpdir + modulePath);
        log.debug('resolve', '-', module ,'==>', finalPath);
        return finalPath
    }
};

global.__hiipack__ = __hiipack__;
global.__hii__ = __hiipack__;
global.log = log;
global.program = program;

module.exports = __hiipack__;