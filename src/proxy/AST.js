/**
 * @file parse rewrite file to javascript object
 * @author zdying
 */

/**
 * Parse rewrite source file to AST tree
 * @param sourceCode
 * @returns {{}}
 */
module.exports = function parseRewrite(sourceCode){
    var res = {
        baseRules: [],
        domains: [],
        commands: []
    };
    var target = res;
    var history = [];

    var pureContent = sourceCode.toString();

    pureContent = pureContent
        // 去掉注释
        .replace(/\s*#.*$/gm, '')
        // 去掉全部是空行
        .replace(/^\s+$/gm, '')
        // 将末尾的·}·换行
        .replace(/([^\s]+)\}$/gm, '$1\n}')
        // 将换行后的·;·取消换行
        .replace(/\n\r?\s*;\s*$/gm, ';');

    // console.log();
    // console.log(':::pureContent:::');
    // console.log(pureContent);

    var lines = pureContent.split(/\n\r?/);
    var regSpace = /\s+/g;
    var regs = {
        baseRule: /^(.*?\s*=>\s*[^\{\}]*)$/,
        cmd: /^(\w+(?:\s[^\{]+)+)$/,
        // rule: /(.*?\s*=>\s*\{[\s\S]*?\})/,
        domainStart: /^([^\/]+) => \{$/,
        locationStart: /^location\s((~\s*)?\/.*?)+\s\{$/,
        end: /^}$/
    };
    // 注意: 正则表达式是有顺序的, baseRule必须在cmd之前;

    lines.forEach(function(line, index){
        line = line.trim().replace(/;\s*$/, '').replace(regSpace, ' ');
        // console.log((100 + index + '').slice(1), line);
        for(var type in regs){
            if(regs[type].test(line)){
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
                            props: {}
                        });
                        history.push(target);
                        target = target.domains[target.domains.length - 1];
                        break;

                    case 'locationStart':
                        target.location.push({
                            location: line.replace(/~\s*/, '~').split(' ')[1],
                            commands: [],
                            props: {}
                        });
                        history.push(target);
                        target = target.location[target.location.length - 1];
                        break;

                    case 'end':
                        target = history.pop();
                        break;
                }

                break;
            }
        }
    });

    return res
};

// test
// var fs = require('fs');
// var sourceCode = fs.readFileSync(__dirname + '/example/rewrite');
// var rules = module.exports(sourceCode);
// console.log();
// console.log(':::AST:::');
// console.log(JSON.stringify(rules, null, 4));