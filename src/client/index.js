/**
 * @file
 * @author zdying
 */
var colors = require('colors');
var replace = require('replace');
var webpack = require('webpack');
var child_process = require('child_process');
var exec = child_process.exec;
var execSync = child_process.execSync;

var configUtil = require('../webpackConfig');

var steps = require('../helpers/steps');

var fse = require('fs-extra');
var fs = require('fs');

var logPrex = '[log]'.green.bold;
var warnPrex = '[warn]'.yellow.bold;
var errPrex = '[error]'.red.bold;

module.exports = {
    /**
     * 初始化一个项目
     * @param argv
     */
    init: function(projName, type, registry){
        var path = require('path');
        var templatePath = path.resolve(__dirname, '..', '..', 'tmpl', type);
        var targetPath = process.cwd() + '/' + projName;

        // console.log(logPrex, '[copy]', templatePath.magenta.bold, 'to', targetPath.magenta.bold);
        steps.printTitle('copy template files');

        fse.copy(templatePath, targetPath, function(err){
            if(err){
                steps.printErrorIcon();
                console.error(err);
                return
            }
            steps.printSuccessIcon();
            this._replaceProjectName(projName, targetPath, registry);
        }.bind(this));
    },

    _build: function(config, callback){
        var createCompiler = function(config, cbk){
            var compiler = webpack(config);
            var entry = Object.keys(config.entry);

            var oldCwd = process.cwd();

            process.chdir(__hiipack_root__);

            compiler.plugin("compile", function(){
                // this.isCompiling = true;
                console.log('compiling: [' + entry.join('.js, ') + '.js]');
            }.bind(this));

            compiler.plugin("done", function(){
                process.chdir(oldCwd)
            });

            compiler.run(function(err, state){
                if(err){
                    console.log(err);
                }else{
                    console.log(state.toString({
                        colors: true,
                        timings: true,
                        chunks: false,
                        children: false
                    }));
                    cbk && cbk(state)
                }
            });

            return compiler
        };

        createCompiler(config, callback)
    },

    /**
     * 打包压缩线上版本代码
     * @param cbk
     */
    build: function(cbk){
        var workPath = process.cwd();
        var dllConfig = configUtil.getPrdDLLConfig(workPath);

        steps.printTitle('clean ./prd/* && ./ver/*');

        try{
            execSync('rm -rdf ./prd && rm -rdf ./ver');
            steps.printSuccessIcon();
            this._build(dllConfig, function(){
                var config = configUtil.getPrdConfig(workPath);
                this._build(config, cbk)
            }.bind(this))
        }catch(e){
            steps.printErrorIcon();
            console.log(e.toString());
        }
    },

    /**
     * 打包dev版本代码
     * @param callback
     */
    pack: function(callback){
        var workPath = process.cwd();
        var dllConfig = configUtil.getDevDLLConfig(workPath);
        //TODO userConfig 可以直接作为参数传进去
        var userConfig = require(workPath + '/config');
        var hasLib = userConfig.library && Object.keys(userConfig.library).length > 0;

        steps.printTitle('clean ./dev/*');

        try{
            execSync('rm -rdf ./dev');
            steps.printSuccessIcon();

            if(hasLib){
                this._build(dllConfig, function(){
                    var config = configUtil.getDevConfig(workPath);
                    this._build(config)
                }.bind(this))
            }else{
                var config = configUtil.getDevConfig(workPath);
                this._build(config)
            }
        }catch(e){
            steps.printErrorIcon();
            console.log(e.toString());
        }
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
                                console.log(err);
                                return
                            }
                            clearInterval(timer);
                            steps.clearLine();
                            steps.printTitle('installing dependencies');
                            steps.printSuccessIcon();
                            steps.showCursor();
                            console.log('');
                            console.log('init success :)'.bold.green);
                            console.log('Now you may need to exec `'.bold + 'hii start'.yellow.bold + '` to start a service '.bold);
                        });
                    }
                };

                items.forEach(function(file){
                    var stat = fs.statSync(file);

                    if(stat.isFile()){
                        fs.readFile(file, function(err, data){
                            if(err){
                                return console.log(errPrex, err);
                            }
                            var fileContent = data.toString();

                            fileContent = fileContent.replace(/\$PROJECT_NAME\$/gm, projName);

                            fs.writeFile(file, fileContent, function(err){
                                count++;
                                // if(!err){
                                //     console.log(logPrex, 'write file: '.green, file.bold);
                                // }else{
                                //     console.log(errPrex, 'write error: '.red, file.bold);
                                //     console.log(err);
                                // }
                                finish();
                            });
                        })
                    }else if(stat.isDirectory()){
                        // console.log(logPrex, 'copy directory: '.blue, file.bold);
                        count++;
                        finish();
                    }
                });
            })
    }
};
