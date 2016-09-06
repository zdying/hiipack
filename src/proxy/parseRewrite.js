/**
 * @file parse rewrite file to javascript object
 * @author zdying
 */
var fs = require('fs');

var PROP_CMD = ['proxy'];
var FUNC_CMD = [
    // proxy request config
    'proxy_set_header',
    'proxy_del_header',

    'proxy_set_cookie',
    'proxy_del_cookie',

    // response config
    'hide_cookie',
    'hide_header',
    'set_header',
    'set_cookie'
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

    // console.log(pureContent);
    // console.log('------------------------------------');

    pureContent = pureContent
                    .replace(/\s*#.*$/gm, '')
                    .replace(/^\s+$/gm, '');

    // console.log(pureContent);

    var rules = parseRule(pureContent);
    var simpleRules = parseBaseRule(pureContent);

    rules = rules.concat(simpleRules);

    rules.forEach(function(rule){
        var source = rule.source;

        delete rule.commands;

        res[source] = rule;
    });

    log.debug(JSON.stringify(res));

    return res
};

function parseBaseRule(pureContent){
    var reg = /^(.*?)\s*=>\s*([^\{\}\n\r]*)$/gm;
    var baseRules = [];
    var result;


    // var type = ['base_rule', 'rule', 'set'];
    // var fullreg = /(.*?\s*=>\s*\{[\s\S]*?\})|(.*?\s*=>\s*[^\{\}\n\r]*)|(set\s+\$\w+\s+\w+)/g;
    //
    // var fullText = pureContent.replace(fullreg, function(match, base_rule, rule, set){
    //     console.log('++++++++++++++++++++++++');
    //     console.log(arguments);
    //     console.log('------------------------');
    //     console.log(match, base_rule, rule, set);
    //     console.log('++++++++++++++++++++++++');
    // });


    while((result = reg.exec(pureContent)) !== null){
        // console.log('result =>', result[1], result[2]);
        baseRules.push({
            source: result[1].trim(),
            proxy: [result[2].trim().replace(/;$/, '')]
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
            commands: result[2].trim()
        })
    }

    rules.forEach(function(rule){
        // var source = rule.source;
        var commands = rule.commands.split(/\n\r?/);

        rule.funcs = [];

        commands.forEach(function(line){
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
// require(__dirname + '/../global');
// module.exports(__dirname + '/example/rewrite');