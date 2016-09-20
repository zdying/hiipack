/**
 * @file
 * @author zdying
 */

var path = require('path');

module.exports = {
    getProjectTMPDIR: function(root){
        var projectName = root.replace(/\/$/, '').split(/[\/\\{1,2}]/).pop();
        var tmpDir = path.resolve(__hii__.codeTmpdir, projectName);

        log.debug('webpackConfig -', projectName.bold.green, 'tmp dir', tmpDir);
        return tmpDir
    }
};