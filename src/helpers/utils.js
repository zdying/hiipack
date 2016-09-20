/**
 * @file
 * @author zdying
 */

module.exports = {
    getProjectTMPDIR: function(root){
        var projectName = root.replace(/\/$/, '').split('/').pop();
        var tmpDir = __hii__.codeTmpdir + '/' + projectName;

        log.debug('webpackConfig -', projectName.bold.green, 'tmp dir', tmpDir);
        return tmpDir
    }
};