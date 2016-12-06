/**
 * @file
 * @author zdying
 */

var fs = require('fs');
var os = require('os');
var path = require('path');
var child_process = require('child_process');

var homeDir = process.env.HOME || process.env.USERPROFILE;

// hiipack temp dir
// try{
//     var hiipackPath = path.join(homeDir, '.hiipack');
//     var hiipackTempldatePath = path.join(__dirname, '../../', 'tmpl/_hiipack');
//
//     fse.mkdirsSync(hiipackPath);
//
//     fse.copy(hiipackTempldatePath, hiipackPath, function(err){
//         if(err) console.error(err);
//     });
// }catch(e){
//     console.error('make dir .hiipack/cache or .hiipack/code failed ==>', e.message);
// }

try{
    var hiircPath = path.join(homeDir, '.hiirc');

    if(!fs.existsSync(hiircPath)){
        fs.writeFileSync(hiircPath, [
            'registry=',
            'system_proxy='
        ].join('\n'));
    }else{
        console.log(hiircPath, 'already exists, content:');
        console.log(fs.readFileSync(hiircPath, 'utf8'));
    }
}catch(e){
    console.error('hiipack config file `.hiirc` create failed ==>', e.message)
}

try{
    var globalBoot = child_process.execSync('npm root -g').toString().trim();

    fs.writeFileSync(path.resolve(__dirname, '../globalRoot.js'), 'module.exports="' + globalBoot + '"');
}catch(e){
    console.error('npm global root set failed.', e.message);
}
