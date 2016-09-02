/**
 * @file
 * @author zdying
 */

var pkg = require('../../helpers/package');

module.exports = function parseLoaders(customLoaders){
    var self = this;
    var loaders = [];

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

        if(loader.loader){
            // type1 ==> 直接使用loader
            installLoader(loader);
            loaders.push(loader);
        }else{
            // type2/type3 ==> 先安装,然后设置
            for(var denpendence in loader){
                if(loader.hasOwnProperty(denpendence)){
                    var currLoader = loader[denpendence];
                    var currLoaderType = typeof currLoader;
                    var loaderResult = null;

                    if(currLoaderType === 'function'){
                        // type2
                        loaderResult = self.installCustomDependencies(denpendence, 'loaders', currLoader);
                    }else if(currLoaderType === 'object' && currLoader !== null){
                        // type3
                        self.installCustomDependencies(denpendence, 'loaders', null);

                        log.debug('loader config is object:', JSON.stringify(currLoader));
                        loaderResult = currLoader
                    }

                    installLoader(loaderResult);

                    loaders.push(loaderResult)
                }
            }
        }
    });

    return loaders
};

function installLoader(loader){
    var loaderContent = loader.loader;
    var loaders = Array.isArray(loaderContent) ? loaderContent : loaderContent.split('!');
    var tmpdir = __hiipack__.tmpdir;
    var installed = false;
    // 需要安装的package
    var loadersName = loaders.map(function(name){
        var _name = name.split('?')[0];
        if(_name.indexOf('-loader') === -1){
            _name += '-loader';
        }

        var exists = pkg.checkIfPackageExist(_name);

        if(exists){
            return ''
        }else{
            return _name
        }
    });

    loadersName = loadersName.join(' ').trim();

    // 如果需要安装的模块不为空, 安装相应的模块
    if(loadersName !== ''){
        installed = pkg.installPackageAndDependencies(loadersName, 'loader')
    }

    return installed
}