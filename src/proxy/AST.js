/**
 * @file parse rewrite file to javascript object
 * @author zdying
 */
var fs = require('fs');

/**
 * Parse rewrite source file to AST tree
 * @param filePath
 * @returns {{}}
 */
module.exports = function parseRewrite(filePath){
    var res = {
        baseRules: [],
        domains: [],
        commands: []
    };
    var target = res;
    var history = [];

    var input = fs.readFileSync(filePath);
    var pureContent = input.toString();

    pureContent = pureContent
        // 去掉注释
        .replace(/\s*#.*$/gm, '')
        // 去掉全部是空行
        .replace(/^\s+$/gm, '')
        // 将末尾的·}·换行
        .replace(/([^\s]+)\}$/gm, '$1\n}')
        // 将换行后的·;·取消换行
        .replace(/\n\r?\s+;\s*$/gm, ';');

    console.log();
    console.log(':::pureContent:::');
    console.log(pureContent);

    var lines = pureContent.split(/\n\r?/);
    // var regSpace = /\s+/g;
    var regs = {
        cmd: /^(\w+(?:\s+[^=>\{]+)+)$/,
        baseRule: /^(.*?\s*=>\s*[^\{\}]*)$/,
        // rule: /(.*?\s*=>\s*\{[\s\S]*?\})/,
        domainStart: /^([^\/]+)\s*=>\s*\{$/,
        locationStart: /^location\s+(\/.*?)+\s+\{$/,
        end: /^}$/
    };

    lines.forEach(function(line, index){
        line = line.trim().replace(/;\s*$/, '');
        // console.log((100 + index + '').slice(1), line);
        for(var type in regs){
            if(regs[type].test(line)){
                // console.log('[' + type + ']\t', line);
                switch(type){
                    case 'cmd':
                        target.commands.push(line);
                        break;

                    case 'baseRule':
                        target.baseRules.push(line);
                        break;

                    case 'domainStart':
                        target.domains.push({
                            domain: line.split(/\s*=>\s*/)[0],
                            commands: [],
                            location: [],
                        });
                        history.push(target);
                        target = target.domains[target.domains.length - 1];
                        break;

                    case 'locationStart':
                        target.location.push({
                            location: line.split(/\s+/)[1],
                            commands: []
                        });
                        history.push(target);
                        target = target.location[target.location.length - 1]
                        break;

                    case 'end':
                        target = history.pop();
                        break;
                }
            }
        }
    });

    return res
};

// test
var rules = module.exports(__dirname + '/example/rewrite');
console.log();
console.log(':::AST:::');
console.log(JSON.stringify(rules, null, 4));