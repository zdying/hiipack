/**
 * @file parse rewrite file to javascript object
 * @author zdying
 */
var fs = require('fs');

var PROP_CMD = ['target'];
var FUNC_CMD = [
    'set_header',
    'del_header',
    'disable_header',

    'set_cookie',
    'del_cookie',
    'disable_cookit',

    'set_res_header'
];

/**
 * parse rewrite file to javascript object
 * @param filePath
 * @returns {{}}
 */
module.exports = function parseRewrite(filePath){
    var res = {};

    var hosts = fs.readFileSync(filePath);
    var pureContent = hosts.toString();

    console.log(pureContent);

    console.log('------------------------------------');

    pureContent = pureContent
                    .replace(/\s*#.*$/gm, '')
                    .replace(/^\s+$/gm, '');

    console.log(pureContent);

    var rules = parseRule(pureContent);
    var simpleRules = parseBaseRule(pureContent);

    rules = rules.concat(simpleRules);

    rules.forEach(function(rule){
        var source = rule.source;

        delete rule._target;

        res[source] = rule;
    });

    log.debug(JSON.stringify(res));

    return res
};

function parseBaseRule(pureContent){
    var reg = /^(.*?)\s*=>\s*([^\{\}}]*)$/gm;
    var baseRules = [];
    var result;

    while((result = reg.exec(pureContent)) !== null){
        // console.log('result =>', result[1], result[2]);
        baseRules.push({
            source: result[1],
            target: result[2]
        })
    }

    // console.log('============================================');
    // console.log(JSON.stringify(baseRules, null, 4));
    // console.log('total', baseRules.length, 'base rules');
    // console.log('============================================');

    return baseRules;
}

function parseRule(pureContent){
    var reg = /(.*?)\s*=>\s*\{([\s\S]*?)\}/g;
    var rules = [];
    var result;

    while((result = reg.exec(pureContent)) !== null){
        // console.log('result =>', result[1], result[2]);
        rules.push({
            source: result[1],
            _target: result[2].trim()
        })
    }

    rules.forEach(function(rule){
        // var source = rule.source;
        var targetLines = rule._target.split(/\n\r?/);

        rule.funcs = [];

        targetLines.forEach(function(line){
            line = line.trim().replace(/;\s*$/, '');

            if(!line){
                return
            }

            var tokens = line.split(/\s+/);
            var command, params;

            if(tokens && tokens.length){
                command = tokens[0];
                params = tokens.slice(1);

                if(FUNC_CMD.indexOf(command) !== -1){
                    rule.funcs.push({
                        func: command,
                        params: params
                    })
                }else if(PROP_CMD.indexOf(command) !== -1){
                    rule[command] = params;
                }else{
                    console.log('[error] unexpected command', command);
                }
            }
        });
    });

    // console.log('============================================');
    // console.log(JSON.stringify(rules, null, 4));
    // console.log('total', rules.length, 'rules');
    // console.log('============================================');

    return rules;
}

// test
// module.exports(__dirname + '/rewrite');