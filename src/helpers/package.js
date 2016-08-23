/**
 * @file package管理
 * @author zdying
 */
var fs = require('fs');
var child_process = require('child_process');
var log = require('../helpers/log');
var logger = log.namespace('package');

module.exports = {
    /**
     * 检测package是否存在
     * @param moduleName
     * @returns {*}
     */
    checkIfPackageExist: function(moduleName){
        // var relativePath = '/node_modules/' + moduleName;
        // var existsInTmp = fs.existsSync(__hii__.tmpdir + relativePath);
        // var existsInRoot = fs.existsSync(__hii__.root + relativePath);
        //
        // var logTips = ['loader', moduleName.bold.green, 'is already exists, position'].join(' ');
        //
        // if (existsInTmp) {
        //     logger.info(logTips, "TMP_DIR".bold.green,', skip it.');
        // }
        //
        // if(existsInRoot){
        //     logger.info(logTips, "HIIPACK_ROOT".bold.green,', skip it.');
        // }
        //
        // return existsInRoot || existsInTmp
        return !!this.getPackagePath(moduleName)
    },

    getPackagePath: function(moduleName){
        if(!moduleName){
            throw Error('module name should not be empty.');
        }

        var modulePath = '/node_modules/' + moduleName;
        var dirs = [__hii__.cwd, __hii__.root, __hii__.globalRoot, __hii__.tmpdir];
        var tips = ['PROJECT_ROOT', 'HIIPACK_ROOT', 'GLOBAL_ROOT', 'HIIPACK_TMP_DIR'];
        var logTips = ['loader', moduleName.bold.green, 'is already exists, position'].join(' ');
        var finalPath = '';

        dirs.forEach(function(dir, index){
            dir = dir.replace(/\/node\_modules\/?$/, '');
            if(!finalPath){
                var _path = dir + modulePath;
                var isExist  = fs.existsSync(_path);

                if(isExist){
                    finalPath = _path;
                    logger.info(logTips, tips[index].bold.green);
                }else{
                    log.debug('package', '-', _path.green, 'not exists.')
                }
            }
        });

        return finalPath
    },

    /**
     * 安装package到临时目录
     * @param package
     * @param type
     * @returns {*}
     */
    installPackage: function(package, type){
        var packages = Array.isArray(package) ? package : package.split(/\s+/);
        var pkgsNeedInstall = [];

        packages.forEach(function(pkg, index){
            var isExist = this.checkIfPackageExist(pkg);

            if(!isExist){
                pkgsNeedInstall.push(pkg)
            }
        }.bind(this));

        if(pkgsNeedInstall.length){
            type = type || 'package';
            logger.info('installing', type, pkgsNeedInstall.join(' ').bold.green, '...');

            return this.install(pkgsNeedInstall);
        }

        return false
    },

    /**
     * 安装
     * @param package
     * @returns {boolean}
     */
    install: function(package){
        if(Array.isArray(package)){
            package = package.join(' ');
        }
        try{
            var cmd = 'npm install ' + package + (program.registry ? ' --registry ' + program.registry : '');

            logger.debug('exec command', cmd.bold);

            child_process.execSync(cmd, { cwd: __hii__.tmpdir, stdio: 'ignore' });
            return true
        }catch(err){
            logger.error(err);
            return false
        }
    },

    /**
     * 安装某个package对应的依赖
     * @param package
     * @param type
     */
    installDependencies: function(package, type){
        var self = this;
        // 安装peerDependencies
        package.split(' ').forEach(function(loader, index){
            logger.info('finding', type, 'for', loader.green);

            var tmpModulesPath = __hii__.tmpdir + '/node_modules/';
            var packageInfo = require(tmpModulesPath + loader + '/package.json');
            var peerDependencies = packageInfo[type] || {};
            var deps = Object.keys(peerDependencies);

            if(deps.length){
                // 查找结果
                logger.info(loader.green, type, deps.toString().green);

                deps.forEach(function(dep){
                    self.installPackage(dep, 'peerDependency');
                })
            }else{

            }
        });
    }
};