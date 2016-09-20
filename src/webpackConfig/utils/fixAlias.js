/**
 * @file
 * @author zdying
 */
module.exports = function fixAlias(alias){
    for(var key in alias){
        alias[key] = alias[key].replace(/\/$/, '')
    }

    return alias
};