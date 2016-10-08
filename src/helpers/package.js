/**
 * @file package管理
 * @author zdying
 */
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var log = require('../helpers/log');
var logger = log.namespace('package');

module.exports = {
    /**
     * 检测package是否存在
     * @param moduleName
     * @returns {*}
     */
    checkIfPackageExist: function(moduleName, version){
        return !!this.getPackagePath(moduleName, version)
    },

    /**
     * 获取package的路径
     * @param moduleName
     * @param version
     * @returns {string}
     */
    getPackagePath: function(moduleName, version){
        if(path.isAbsolute(moduleName)){
            return moduleName
        }

        if(moduleName.indexOf('@') !== -1){
            version = moduleName.split('@')[1];
            moduleName = moduleName.split('@')[0];
        }
        console.log('getpackage path ===========================', moduleName, version);
        if(!moduleName){
            throw Error('module name should not be empty.');
        }

        var modulePath = '/node_modules/' + moduleName;
        var dirs = [__hii__.cwd, __hii__.root, __hii__.globalRoot, __hii__.tmpdir];
        var tips = ['PROJECT_ROOT', 'HIIPACK_ROOT', 'GLOBAL_ROOT', 'HIIPACK_TMP_DIR'];
        var logTips = ['loader', version, moduleName.bold.green, 'is already exists, position'].join(' ');
        var finalPath = '';

        if(version){
            dirs.splice(3, 0, path.resolve(__hii__.tmpdir, '..', 'hiipack_cache_with_version'));
            tips.splice(3, 0, 'HIIPACK_TMP_DIR_WITH_VERSION');
        }

        dirs.forEach(function(dir, index){
            dir = dir.replace(/\/node\_modules\/?$/, '');
            var withVersionDir = dir.match(/hiipack_cache_with_version$/);
            if(!finalPath){
                if(version && withVersionDir){
                    modulePath += '@' + version;
                }

                var _path = path.join(dir, modulePath);
                var isExist  = fs.existsSync(_path);

                if(isExist){
                    if(version && !withVersionDir && require(path.join(_path, 'package.json')).version !== version){
                        // 如果指定了version并且不再with_version文件夹里并且版本号不符合，视为没有找到
                    }else{
                        finalPath = _path;
                        logger.debug(logTips, tips[index].bold.green);
                    }
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
        var installed = false;
        var packages = Array.isArray(package) ? package : package.split(/\s+/);
        var pkgsNeedInstall = [];
        var pkgsNeedInstallWithVersion = [];

        packages.forEach(function(pkg, index){
            var pkgArr = pkg.split('@');
            var pkgName = pkgArr[0];
            var pkgVer = pkgArr[1];
            var isExist = this.checkIfPackageExist(pkgName, pkgVer);

            if(!isExist){
                if(pkg === 'vue-loader'){
                    pkg += '@8.5.4'
                }
                if(pkgArr.length === 2){
                    // 带版本号
                    pkgsNeedInstallWithVersion.push(pkg)
                }else{
                    pkgsNeedInstall.push(pkg)
                }
            }
        }.bind(this));

        if(pkgsNeedInstall.length){
            type = type || 'package';
            logger.info('installing', type, pkgsNeedInstall.join(' ').bold.green, '...');

            this.install(pkgsNeedInstall);

            installed = true;
        }

        if(pkgsNeedInstallWithVersion.length){
            type = type || 'package';
            logger.info('installing with version', type, pkgsNeedInstallWithVersion.join(' ').bold.green, '...');

            this.install(pkgsNeedInstallWithVersion, true);

            installed = true;
        }

        return installed
    },

    /**
     * 安装
     * @param package
     * @param withVersion
     * @returns {boolean}
     */
    install: function(package, withVersion){
        var cwd = withVersion ? __hii__.tmpdirWithVersion : __hii__.tmpdir;
        if(Array.isArray(package)){
            package = package.join(' ');
        }
        try{
            var cmd = 'npm install ' + package + (program.registry ? ' --registry ' + program.registry : '');

            logger.debug('exec command', cmd.bold, cwd);

            child_process.execSync(cmd, { cwd: cwd, stdio: 'ignore' });

            if(withVersion){
                package.split(' ').forEach(function(pkg){
                    try{
                        fs.renameSync(path.resolve(cwd, 'node_modules', pkg.split('@')[0]), path.resolve(cwd, 'node_modules', pkg));
                        log.debug('renameed', pkg.split('@')[0], '==>'.bold, pkg);
                    }catch(err){
                        log.error(err);
                    }
                })
            }

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
        package.split(' ').forEach(function(currentLoader, index){
            logger.info('finding', type, 'for', currentLoader.green);

            var tmpModulesPath = __hii__.tmpdir + '/node_modules/';
            try{
                var packageInfo = require(tmpModulesPath + currentLoader.split('@')[0] + '/package.json');
                var peerDependencies = packageInfo[type] || {};
                var deps = Object.keys(peerDependencies);

                if(deps.length){
                    // 查找结果
                    logger.info(currentLoader.green, type, deps.toString().green);

                    deps.forEach(function(dep){
                        self.installPackage(dep, 'peerDependency');
                    })
                }else{

                }
            }catch(e){
                log.debug('loader', currentLoader.green, 'not exists in ', tmpModulesPath.bold, 'skip to install peer dependencies.')
            }
        });
    },
    
    installPackageAndDependencies: function(packages, type){
        var installed = this.installPackage(packages, type);

        if(installed){
            this.installDependencies(packages, 'peerDependencies')
        }

        return installed
    }
};

//test
// require('../global');
// console.log(module.exports.getPackagePath('big.js'), 1);
// console.log(module.exports.getPackagePath('big.js', '1.2.3'), 2);
// console.log(module.exports.getPackagePath('big.js', '1.2.4'), 3);
// console.log(module.exports.getPackagePath('big.js', '3.1.3'), 4);