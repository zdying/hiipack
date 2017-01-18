/**
 * @file
 * @author zdying
 */

'use strict';

var fs = require('fs');
var path = require('path');

var logger = log.namespace('Server');
var compiler = require('../../compiler');

var fileExplorer = require('../../helpers/fileExplorer');

module.exports = function(req, res, next){
    var url = req.url;
    var projInfo = this.getProjectInfoFromURL(url);

    logger.debug('projInfo:' + JSON.stringify(projInfo));

    if(projInfo){
        var projectName = projInfo.projectName;
        var fileExt = projInfo.fileExt;
        var root = path.join(__hii__.cwd, projectName);
        var args = [projInfo, root, req, res];

        if(fileExt === 'scss'){
            compileSCSS.apply(this, args);
        }else if(fileExt === 'js'){
            compileJS.apply(this, args);
        }else if(fileExt === 'css'){
            compileCSS.apply(this, args);
        }else{
            sendNormalFile.call(this, projInfo, root, req, res);
        }
    }else{
        fileExplor.call(this, req, res);
    }
};

function compileJS(projInfo, root, req, res){
    var filePath = __hii__.cwd + req.url;
    var env = projInfo.env;

    if(env === 'prd' || req.url.indexOf('hot-update.js') !== -1){
        // method: 1
        // return compiler.compile(function(){
        //     this.sendCompiledFile(req, projInfo)
        // }.bind(this))

        // method: 2
        compiler.compile(projInfo.projectName, root, 'loc', { watch: true }, function(){
            this.sendCompiledFile(req, projInfo)
        }.bind(this));
    }else if(env === 'dev'){
        filePath = filePath.replace(/@(\w+)\.(\w+)/, '@dev.$2');

        logger.debug(req.url, '==>', filePath);

        if(fs.statSync(filePath).isFile()){
            this.sendFile(req, filePath)
        }
    }else if(env === 'src'){
        this.sendFile(req)
    }else if(env === 'loc'){
        this.sendCompiledFile(req)
    }
}

function compileCSS(projInfo, root, req, res){
    var filePath = __hii__.cwd + req.url;
    var env = projInfo.env;
    var projectName = projInfo.projectName;
    var configPath = path.join(__hii__.cwd, projectName, 'hii.config.js');

    if(env === 'src' && fs.existsSync(filePath)){
        this.sendFile(req, filePath);
    }else{
        return compiler.compile(projectName, root, 'loc', { watch: true }, function(){
            var userConfig = require(configPath);
            var entry = userConfig.entry;
            var entries = Object.keys(entry);
            var fileName = ((projInfo.folder || '') + '/' + projInfo.fileName).replace('/', '');
            var compiledFilePath = path.join(
                __hii__.codeTmpdir,
                req.url.replace(/@(\w+)\.(\w+)/, '.$2').replace(/[\\\/](prd|dev|src)[\\\/]/, '/loc/')
            );

            if(entries.indexOf(fileName) !== -1){
                // 是入口CSS文件
                if(fs.existsSync(compiledFilePath)){
                    this.sendFile(req, compiledFilePath)
                }else{
                    // 处理css文件
                    res.setHeader('Content-Type', 'text/css');
                    logger.debug('css -', filePath.bold, 'replaced');
                    res.end('/* The `css` code in development environment has been moved to the `js` file */');
                    logger.access(req);
                }
            }else{
                // will return 404
                this.sendFile(req, filePath);
            }
        }.bind(this));
    }
}

function compileSCSS(projInfo, root, req, res){
    var filePath = __hii__.cwd + req.url;

    // 编译sass文件
    return compiler.compileSASS(filePath, function(err, css, time, result){
        if(err){
            res.statusCode = 500;
            res.end(err.stack || err.message)
        }else{
            res.setHeader('Content-Type', 'text/css');
            res.end(css);
            logger.debug('*.sass', '-', filePath.bold, 'compiled', (time + 'ms').magenta);
        }
        logger.access(req);
    });
}

function sendNormalFile(projInfo, root, req, res){
    // 其它文件
    var filePath = __hii__.cwd + req.url;
    filePath = filePath.replace(/[\\\/]prd[\\\/]/, '/src/');

    logger.debug(req.url, '==>', filePath);

    try{
        if(fs.statSync(filePath).isFile()){
            this.sendFile(req, filePath)
        }
    }catch(e){
        res.statusCode = 404;
        res.end('404 Not Found');
        logger.error(e);
        logger.access(req);
    }
}

function fileExplor(req, res){
    var url = req.url;
    var filePath = __hii__.cwd + url;

    try{
        var stat = fs.statSync(filePath);
        if(stat.isDirectory()){
            // 如果目录没有以`/`结尾
            if(!/\/$/.test(url)){
                res.redirect(url + '/');
                return
            }

            fileExplorer.renderList(url, filePath)
                .then(function(html){
                    res.setHeader('Content-Type', 'text/html');
                    res.end(html);
                    logger.access(req);
                });
        }else{
            this.sendFile(req)
        }
    }catch(e){
        res.statusCode = 404;
        res.end('404 Not Found');

        logger.error(e);
        logger.access(req);
    }
}