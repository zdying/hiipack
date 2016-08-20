/**
 * @file package管理
 * @author zdying
 */
var fs = require('fs');
var child_process = require('child_process');
var logger = log.namespace('package');

module.exports = {
    checkIfPackageExist: function(moduleName){
        var relativePath = '/node_modules/' + moduleName;
        var existsInTmp = fs.existsSync(__hii__.tmpdir + relativePath);
        var existsInRoot = fs.existsSync(__hii__.root + relativePath);

        var logTips = ['loader', moduleName.bold.green, 'is already exists, position'].join(' ');

        if (existsInTmp) {
            logger.info(logTips, "TMP_DIR".bold.green,', skip it.');
        }

        if(existsInRoot){
            logger.info(logTips, "HIIPACK_ROOT".bold.green,', skip it.');
        }

        return existsInRoot || existsInTmp
    },

    installPackage: function(package, type){
        var isExist = this.checkIfPackageExist(package);

        if(!isExist){
            type = type || 'package';
            logger.info('installing', type, package.bold.green, '...');

            return this.install(package);
        }

        return false
    },

    install: function(package){
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

    installDependencies: function(package, type){
        var self = this;
        // 安装peerDependencies
        package.split(' ').forEach(function(loader, index){
            logger.info('finding', type, 'for', loader.green);

            var tmpModulesPath = __hii__.tmpdir + '/node_modules/';
            var packageInfo = require(tmpModulesPath + loader + '/package.json');
            var peerDependencies = packageInfo[type];
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