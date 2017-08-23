/**
 * @file
 * @author zdying
 */

var pkg = require('../../helpers/package');

module.exports = function parseLoaders(customLoaders, type){
    var rules = [];

    if(!customLoaders || Array.isArray(customLoaders) === false){
        return customLoaders
    }

    customLoaders.forEach(function(loader, index){
        /*
         *  loaders: [
         *      // type1
         *      {loader: 'babel', test: /\.js$/},
         *      {
         *          // type2
         *          'dep1': function(dep1, dep1Path){
         *              return {loader: 'babel', test: /\.js$/}
         *          },
         *          // type3
         *          'dep2': {loader: 'babel', test: /\.js$/}
         *      }
         *  ]
         */

        if(type && (type === 'pre' || type === 'post')) {
            loader.enforce = type;
        }

        if(loader.loader){
            // type1 ==> 直接使用loader
            installLoader(loader);
            log.debug('before change loader', JSON.stringify(loader));
            loader.loader = pkg.getPackagePath(loader.loader) || loader.loader;
            log.debug('after change loader', JSON.stringify(loader));
            rules.push(loader);
        }else{
            // type2/type3 ==> 先安装,然后设置
            for(var denpendence in loader){
                if(loader.hasOwnProperty(denpendence)){
                    var currLoader = loader[denpendence];
                    var currLoaderType = typeof currLoader;
                    var loaderResult = null;

                    if(currLoaderType === 'function'){
                        // type2
                        loaderResult = installCustomDependencies(denpendence, 'loaders', currLoader);
                        log.debug('loader config is function:', currLoader);
                    }else if(currLoaderType === 'object' && currLoader !== null){
                        // type3
                        installCustomDependencies(denpendence, 'loaders', null);

                        log.debug('loader config is object:', JSON.stringify(currLoader));
                        loaderResult = currLoader
                    }

                    installLoader(loaderResult);

                    log.debug('before change loader:', JSON.stringify(loaderResult));
                    loaderResult.loader = pkg.getPackagePath(loaderResult.loader) || loaderResult.loader;
                    log.debug('after change loader:', JSON.stringify(loaderResult));

                    rules.push(loaderResult)
                }
            }
        }
    });

    return rules
};

function installLoader(loader){
    var loaderContent = loader.loader;
    var loaders = Array.isArray(loaderContent) ? loaderContent : loaderContent.split('!');
    var installed = false;
    // 需要安装的package
    var loadersName = loaders.map(function(name){
        var _name = name.split('?')[0];
        if(_name.indexOf('-loader') === -1){
            _name += '-loader';
        }

        var exists = pkg.checkIfPackageExist(_name.split('@')[0], _name.split('@')[1]);

        if(exists){
            return ''
        }else{
            return _name
        }
    });

    loadersName = loadersName.join(' ').trim();

    // 如果需要安装的模块不为空, 安装相应的模块
    if(loadersName !== ''){
        log.debug('packages that need to install:', loadersName);
        installed = pkg.installPackageAndDependencies(loadersName, 'loader')
    }

    return installed
}

function installCustomDependencies(pkgs, type, cbk){
    var installed = pkg.installPackageAndDependencies(pkgs, type);

    var params = pkgs.split(' ').map(function(pkgName){
        return pkg.getPackagePath(pkgName);
    });
    var modules = params.map(function(p){
        return require(p)
    });

    if(typeof cbk === 'function'){
        log.debug('call plugin config callback ...');
        var result = cbk.apply(null, modules.concat(params));
        log.debug('loader config callback result:', typeof result === 'function' ? result : JSON.stringify(result));

        return result
    }
}