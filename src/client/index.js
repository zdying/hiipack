/**
 * @file
 * @author zdying
 */
var colors = require('colors');
var webpack = require('webpack');
var child_process = require('child_process');
var exec = child_process.exec;
var execSync = child_process.execSync;

var Compiler = require('../compiler');

var package = require('../helpers/package');
var steps = require('../helpers/steps');
var logger = log.namespace('client');

var fse = require('fs-extra');
var fs = require('fs');

module.exports = {
    /**
     * 初始化一个项目
     * @param argv
     */
    init: function(projName, type, registry){
        var path = require('path');
        var templatePath = path.resolve(__dirname, '..', '..', 'tmpl', type);
        var targetPath = process.cwd() + '/' + projName;

        steps.printTitle('copy template files');

        fse.copy(templatePath, targetPath, function(err){
            if(err){
                steps.printErrorIcon();
                logger.error(err);
                return
            }
            steps.printSuccessIcon();
            this._replaceProjectName(projName, targetPath, registry);
        }.bind(this));
    },

    _build: function(env, callback){
        var workPath = process.cwd();
        var projectName = workPath.split('/').pop();
        var compiler = new Compiler(projectName, workPath);
        var dir = {
            'dev': ['dev'],
            'prd': ['prd', 'ver']
        };

        logger.info('clean folder', '[ ' + dir[env].join(', ').bold.green + ' ]'.bold, '...');

        try{
            // execSync('rm -rdf ./' + dir[env].join(' ./'));
            dir[env].forEach(function(folder){
                 fse.removeSync(folder)
            });
            compiler.compile(env, {watch: false}, callback);
        }catch(e){
            logger.error(e);
        }
    },

    /**
     * 打包压缩线上版本代码
     * @param callback
     */
    build: function(callback){
        this._build('prd', callback)
    },

    /**
     * 打包dev版本代码
     * @param callback
     */
    pack: function(callback){
        this._build('dev', callback)
    },

    /**
     * 上传文件到开发机
     */
    sync: function(){
        var root = process.cwd();
        var rsync = require('./rsync');
        var isExist = fs.existsSync(root + '/dev');

        if(!isExist){
            this.pack(rsync.sync)
        }else{
            rsync.sync();
        }
    },

    /**
     * 跑自动化测试
     */
    test: function(){
        var root = __hii__.cwd;
        var configPath = root + '/hii.config';
        var config = require(configPath);
        var autoTestConfig = config.autoTest || {};
        var frameworks = autoTestConfig.framework || '';
        var asserts = autoTestConfig.assertion || '';

        if(frameworks){
            package.installPackage(Array.isArray(frameworks) ? frameworks.join(' ') : frameworks);
        }

        if(asserts){
            package.installPackage(Array.isArray(asserts) ? asserts.join(' ') : asserts);
        }

        var cmd = __hii__.root + "/node_modules/.bin/mocha --colors --compilers js:" + __hii__.resolve('babel-register');
        // var cmd = "mocha --compilers js:" + __hii__.resolve('babel-register');
        var rcFile = __hii__.cwd + '/.babelrc';
        //TODO resolve时,如果不存在对应的依赖包, 自动安装
        //TODO 解决上面的问题后, 去除hiipack内置依赖`babel-register`
        fs.writeFileSync(
            rcFile,
            JSON.stringify({
                "presets": [__hii__.resolve("babel-preset-es2015")]
            }, null, 4)
        );
        logger.debug('test', '-', 'exec command:', cmd.yellow);
        logger.info('run testing...');
        child_process.exec(cmd, {stdio: [0,1,2]}, function(err, stdout, stderr){
            console.log(stdout);
            console.log(stderr);
            fs.unlink(rcFile);
        });
    },

    /**
     * 替换项目文件中的`项目名称`字段
     * @param projName
     * @param root
     * @param registry
     * @private
     */
    _replaceProjectName: function(projName, root, registry){
        var items = []; // files, directories, symlinks, etc
        steps.printTitle('setup project');
        steps.printSuccessIcon();
        steps.printTitle('rename template files');
        fse.walk(root)
            .on('data', function(item){
                items.push(item.path);
            })
            .on('end', function(){
                var count = 0;
                var len = items.length;
                var finish = function(){
                    if(count === len){
                        steps.printSuccessIcon();

                        var cmd = 'cd ' + projName + ' && npm install' + (registry ? ' --registry ' + registry : '');

                        // steps.printTitle('setup project (installing dependencies)');
                        steps.hideCusror();

                        var _count = 1;
                        var timer = setInterval(function(){
                            var count = _count++;
                            var points = (new Array(count % 5)).join('.');
                            steps.clearLine();
                            steps.printTitle('installing dependencies ' + points);
                        }, 500);

                        exec(cmd, function(err, stdout, stderr){
                            if(err){
                                steps.printErrorIcon();
                                logger.error(err);
                                return
                            }
                            clearInterval(timer);
                            steps.clearLine();
                            steps.printTitle('installing dependencies');
                            steps.printSuccessIcon();
                            steps.showCursor();
                            console.log();
                            console.log('init success :)'.bold.green);
                            console.log('Now you may need to exec `'.bold + 'hii start'.yellow.bold + '` to start a service '.bold);
                            console.log();
                        });
                    }
                };

                items.forEach(function(file){
                    var stat = fs.statSync(file);

                    if(stat.isFile()){
                        fs.readFile(file, function(err, data){
                            if(err){
                                return logger.error(err);
                            }
                            var fileContent = data.toString();

                            fileContent = fileContent.replace(/\$PROJECT_NAME\$/gm, projName);

                            fs.writeFile(file, fileContent, function(err){
                                count++;
                                finish();
                            });
                        })
                    }else if(stat.isDirectory()){
                        count++;
                        finish();
                    }
                });
            })
    }
};
