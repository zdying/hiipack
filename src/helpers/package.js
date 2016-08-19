/**
 * @file package管理
 * @author zdying
 */
var fs = require('fs');
var child_process = require('child_process');

module.exports = {
    checkIfPackageExist: function(moduleName){
        var relativePath = '/node_modules/' + moduleName;
        var existsInTmp = fs.existsSync(__hii__.tmpdir + relativePath);
        var existsInRoot = fs.existsSync(__hii__.root + relativePath);

        var logTips = ['loader', '-', 'loader', moduleName.bold.green, 'is already exists, position'].join(' ');

        if (existsInTmp) {
            log.info(logTips, "TMP_DIR".bold.green,', skip it.');
        }

        if(existsInRoot){
            log.info(logTips, "HIIPACK_ROOT".bold.green,', skip it.');
        }

        return existsInRoot || existsInTmp
    },

    installPackage: function(package, type){
        var isExist = this.checkIfPackageExist(package);

        if(!isExist){
            type = type || 'package';
            log.info('install', '-' , 'installing', type, package.bold.green, '...');

            return this.install(package);
        }

        return false
    },

    install: function(package){
        try{
            child_process.execSync('npm install ' + package, { cwd: __hii__.tmpdir, stdio: 'ignore' });
            return true
        }catch(err){
            log.error(err);
            return false
        }
    },

    installDependencies: function(package, type){
        var self = this;
        // 安装peerDependencies
        package.split(' ').forEach(function(loader, index){
            log.info('install', '-', 'finding', type, 'for', loader.green);

            var tmpModulesPath = __hii__.tmpdir + '/node_modules/';
            var packageInfo = require(tmpModulesPath + loader + '/package.json');
            var peerDependencies = packageInfo[type];
            var deps = Object.keys(peerDependencies);

            if(deps.length){
                // 查找结果
                log.info('install', '-', loader.green, type, deps.toString().green);

                deps.forEach(function(dep){
                    self.installPackage(dep, 'peerDependency');
                })
            }else{

            }
        });
    }
};