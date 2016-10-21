/**
 * @file
 * @author zdying
 */

'use strict';

var fse = require('fs-extra');
var path = require('path');

require('../global');

try{
    fse.copy(path.resolve(__hiipack__.root, 'tmpl', '_cache'), __hiipack__.tmpdir, function(err){
        if(err) console.error(err);
    });

    fse.copy(path.resolve(__hiipack__.root, 'tmpl', '_cache'), __hiipack__.tmpdirWithVersion, function(err){
        if(err) console.error(err);
    });
}catch(e){
    console.log('error:', e)
}