/**
 * @file
 * @author zdying
 */

'use strict';

var path = require('path');
var fse = require('fs-extra');
var os = require('os');

module.exports = function copyHiiTemplate(){
    try{
        var hiipackPath = path.join(os.tmpdir(), 'hiipack');
        var hiipackTempldatePath = path.join(__dirname, '../../', 'tmpl/_hiipack');

        fse.mkdirsSync(hiipackPath);

        fse.copy(hiipackTempldatePath, hiipackPath, function(err){
            if(err) console.error(err);
        });
    }catch(e){
        console.error('make dir .hiipack/cache or .hiipack/code failed ==>', e.message);
    }
};