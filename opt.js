/**
 * @file
 * @author zdying
 */
'use strict';

let fs = require('fs');
let path = require('path');

fs.readdir('node_modules', (err, files) => {
    var total = files.length;

    console.log('node_modules共有', total, '个模块');

    var result = [];

    files.forEach((file, index) => {
        let stat = fs.statSync('node_modules/' + file);
        if(stat.isDirectory()){
            // 查找压缩的代码
            // console.log('==>', 'finding', 'node_modules/' + file);
            let minFile = path.resolve('node_modules', file, 'dist', file + '.min.js');
            let minFile1 = path.resolve('node_modules', file, 'dist', file + '.js');
            let minFile2 = path.resolve('node_modules', file, file + '.min.js');

            // console.log(minFile);
            // console.log(minFile1);

            if(fs.existsSync(minFile)){
                result.push(minFile);
                check();
                // return console.log('==> min file detected: ', minFile);
            }

            if(fs.existsSync(minFile1)){
                result.push(minFile1);
                check();
                // return console.log('==> min file detected: ', minFile1);
            }

            if(fs.existsSync(minFile2)){
                result.push(minFile2);
                // return console.log('==> min file detected: ', minFile2);
            }

            // 只有一个js文件的模块
            fs.readdir('node_modules/' + file, function(err, files){
                files = files.filter(f => f.split('.').pop() === 'js');

                if(files.length === 1){
                    result.push('node_modules/' + file + '/' + files[0]);
                }

                check();
                // console.log(file, '==>', 'files:', files);
            });
        }

        function check(){
            if(index === total - 1){
                console.log('查找完毕，共找到', result.length, '个可以优化的模块');
                console.log(result);
            }
        }
    })
});