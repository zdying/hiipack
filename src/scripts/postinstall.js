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
    var hiircPath = path.join(homeDir, '.hiirc.json');

    if(!fs.existsSync(hiircPath)){
        fs.writeFile(hiircPath, JSON.stringify({
            registry: '',
            system_proxy: ''
        }, null, 4))
    }else{
        console.log(hiircPath, 'already exists, content:');
        console.log(require(hiircPath));
    }
}catch(e){
    console.error('hiipack config file `.hiirc` create failed: ', e)
}