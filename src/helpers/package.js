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
     * @param packages
     * @param type
     * @param target
     * @returns {*}
     */
    installPackage: function(packages, type, target){
        packages = Array.isArray(packages) ? packages : packages.split(/\s+/);

        var installed = false;
        var pkgsNeedInstall = [];
        var isWithVersion = this.isWithVersion(packages);

        packages.forEach(function(pkg, index){
            var pkgArr = pkg.split('@');
            var pkgName = pkgArr[0];
            var pkgVer = pkgArr[1];
            var isExist = this.checkIfPackageExist(pkgName, pkgVer);

            if(!isExist){
                pkgsNeedInstall.push(pkg)
            }
        }.bind(this));

        if(pkgsNeedInstall.length){
            type = type || 'package';
            logger.info('installing', type, pkgsNeedInstall.join(' ').bold.green, '...');

            this.install(pkgsNeedInstall, isWithVersion, target);

            installed = true;
        }

        return installed
    },

    /**
     * 安装
     * @param package
     * @param withVersion
     * @param target
     * @returns {boolean}
     */
    install: function(package, withVersion, target){
        var cwd = target || (withVersion ? __hii__.tmpdirWithVersion : __hii__.tmpdir);
        if(Array.isArray(package)){
            package = package.join(' ');
        }
        try{
            var registry = program.registry || __hii_config__.registry;
            var cmd = 'npm install ' + package + (registry ? ' --registry ' + registry : '');

            logger.debug('exec command', cmd.bold, cwd);

            child_process.execSync(cmd, { cwd: cwd, stdio: 'ignore' });

            if(cwd === __hii__.tmpdirWithVersion){
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
     * @param packages
     * @param type
     */
    installDependencies: function(packages, type){
        var isWithVersion = this.isWithVersion(packages);
        var self = this;
        // 安装peerDependencies
        packages.split(' ').forEach(function(currentLoader, index){
            logger.info('finding', type, 'for', currentLoader.green);

            var tmpModulesPath = (isWithVersion ? __hii__.tmpdirWithVersion : __hii__.tmpdir) + '/node_modules/';
            try{
                var packageInfo = require(tmpModulesPath + currentLoader + '/package.json');
                var peerDependencies = packageInfo[type] || {};
                var deps = Object.keys(peerDependencies);

                if(deps.length){
                    // 查找结果
                    logger.info(currentLoader.green, type, deps.toString().green);

                    deps.forEach(function(dep){
                        self.installPackage(dep, 'peerDependency'/*, tmpModulesPath + currentLoader*/);
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
    },

    isWithVersion: function(packages){
        if(!Array.isArray(packages)){
            packages = packages.split(/\s+/);
        }

        return packages.some(function(package){
            return package.indexOf('@') !== -1;
        })
    }
};

//test
// require('../global');
// console.log(module.exports.getPackagePath('big.js'), 1);
// console.log(module.exports.getPackagePath('big.js', '1.2.3'), 2);
// console.log(module.exports.getPackagePath('big.js', '1.2.4'), 3);
// console.log(module.exports.getPackagePath('big.js', '3.1.3'), 4);