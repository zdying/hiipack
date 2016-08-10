/**
 * @file
 * @author zdying
 */
var fs = require('fs');
var path = require('path');

// from http://lmws.net/making-directory-along-with-missing-parents-in-node-js
function mkdirParent(dirPath, mode, callback) {
    //Call the standard fs.mkdir
    fs.mkdir(dirPath, mode, function(error) {
        //When it fail in this way, do the custom steps
        if (error && error.errno === 34) {
            //Create all the parents recursively
            fs.mkdirParent(path.dirname(dirPath), mode, callback);
            //And then the directory
            fs.mkdirParent(dirPath, mode, callback);
        }
        //Manually run the callback since we used our own callback to do all these
        callback && callback(error);
    });
}

var md5File = require('md5-file');

function VersionPlugin(hashLength, pattern){
    hashLength = hashLength || 6;

    if(pattern && typeof pattern.test !== 'function'){
        console.log('[error]'.red, 'invalid pattern param.');
        return function(){}
    }

    return function(){
        this.plugin("done", function(stats){
            var lines = [];
            var versions = {};
            var assets = stats.compilation.assets;
            var context = stats.compilation.compiler.context;

            var handerChunk = function(fileName, filePath){
                if(!pattern || !(pattern && pattern.test(fileName))){
                    var md5 = md5File.sync(filePath);
                    md5 = md5.slice(0, hashLength);
                    fs.rename(filePath, filePath.replace(/\.(js|css)$/, '@' + md5 + '.$1'), function(err){
                        if(err) console.log('[ERROR]'.bold.red, err.message);
                    });
                    lines.push(fileName + '#' + md5);
                }
            };

            for(var fileName in assets){
                var info = assets[fileName];
                var filePath = info.existsAt;

                handerChunk(fileName, filePath);
            }

            // try{
            //     require('child_process').execSync('cd ' + context + ' && mkdir ver')
            // }catch(err){
            //     console.log('[ERROR]'.bold.red, err.message);
            // }

            // fs.mkdir('ver', function(err){
            mkdirParent(context + '/ver', function(err){
                var path = context + "/ver/versions.mapping";
                var isExists = fs.existsSync(path);

                if(isExists){
                    fs.writeFile(path, '\n' + lines.join('\n'), {flag: 'a'});
                }else{
                    fs.writeFile(path, lines.join('\n'));
                }
            });
        });
    }
}

module.exports = VersionPlugin;
