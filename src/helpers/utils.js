/**
 * @file
 * @author zdying
 */

var path = require('path');

module.exports = {
    getProjectTMPDIR: function(root){
        //TODO 可以把前面获取到projInfo传递到这里
        // var projectName = root.replace(/\/$/, '').split(/[\/\\{1,2}]/).pop();
        var projectName = root
            .replace(/\/$/, '')
            .replace(__hii__.cwd, '')
            .replace(/^[\/\\]/, '');

        var tmpDir = path.resolve(__hii__.codeTmpdir, projectName);

        log.debug('webpackConfig -', projectName.bold.green, 'tmp dir', tmpDir);
        return tmpDir
    }
};