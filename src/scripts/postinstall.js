/**
 * @file
 * @author zdying
 */

var fs = require('fs');
var os = require('os');
var path = require('path');

var homeDir = os.homedir();

// hiipack temp dir
try{
    var hiipackPath = path.join(homeDir, '.hiipack');
    if(!fs.existsSync(hiipackPath)){
        fs.mkdir(hiipackPath);
    }
}catch(e){
    console.error('make dir .hiipack/cache or .hiipack/code failed.', e);
}

try{
    var hiircPath = path.join(homeDir, '.hiirc');

    if(!fs.existsSync(hiircPath)){
        fs.writeFile(hiircPath, [
            'registry=',
            'system_proxy='
        ].join('\n'));
    }else{
        console.log(hiircPath, 'already exists, content:');
        console.log(fs.readFileSync(hiircPath, 'utf8'));
    }
}catch(e){
    console.error('hiipack config file `.hiirc` create failed: ', e)
}