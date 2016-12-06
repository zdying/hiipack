/**
 * @file
 * @author zdying
 */

var path = require('path');

module.exports = {
    getProjectTMPDIR: function(root){
        //TODO 可以把前面获取到projInfo传递到这里
        var projectName = this.getProjectName(root);

        var tmpDir = path.resolve(__hii__.codeTmpdir, projectName);

        log.debug('webpackConfig -', projectName.bold.green, 'tmp dir', tmpDir);
        return tmpDir
    },

    getProjectName: function(root){
        var projectName = root
            .replace(__hii__.cwd, '')
            .replace(/^[\/\\]|[\/\\]$]/g, '');

        return projectName;
    }
};