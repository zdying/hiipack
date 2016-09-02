/**
 * @file
 * @author zdying
 */
module.exports = function parsePlugins(customPlugins){
    var plugins = [];

    if(!customPlugins || Object.keys(customPlugins).length === 0){
        return plugins
    }

    customPlugins.forEach(function(plugin, index){
        if(typeof plugin.apply === 'function'){
            log.debug('is callable plugin');
            log.detail(plugin);
            plugins.push(plugin);
        }else if(typeof plugin === 'object'){
            Object.keys(plugin).forEach(function(pl){
                plugins.push(installCustomDependencies(pl, 'plugin', plugin[pl]))
            });
        }
    });

    return plugins
};

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