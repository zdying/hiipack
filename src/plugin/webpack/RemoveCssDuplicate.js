/**
 * @file
 * @author zdying
 */
var fs = require('fs');

function RemoveCssDumplicate(){
    return function(){
        this.plugin("done", function(stats){
            var assets = stats.compilation.assets;
            for(var fileName in assets){
                var info = assets[fileName];
                var filePath = info.existsAt;

                if(fileName.split('.').pop() === 'css'){
                    var _start = Date.now();
                    var css = fs.readFileSync(filePath).toString();
                    var rules = [];
                    var ruleReg = /(.*?)\s*\{([\s\S]*?)\}/g;

                    css = css.replace(ruleReg, function(match, rule, content){
                        // @param {String} 类似这样的注视不属于css rule
                        if(content.indexOf(':') === -1){
                            return match
                        }

                        if(rules.indexOf(match) === -1){
                            rules.push(match);
                            return match
                        }else{
                            return ''
                        }
                    });

                    fs.writeFileSync(filePath, css);

                    if(log && log.debug){
                        log.debug('RemoveCssDuplicate - file', fileName.bold, 'finished in', (Date.now() - _start + '').bold, 'ms')
                    }
                }
            }
        });
    }
}

module.exports = RemoveCssDumplicate;
