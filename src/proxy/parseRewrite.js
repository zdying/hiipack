/**
 * @file parse rewrite file to javascript object
 * @author zdying
 */
var fs = require('fs');

var PROP_CMD = ['proxy'];
var FUNC_CMD = [
    // global command
    'set',

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

var cmdFuncs = require('./commands');

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

    var blocks = parseBlock(pureContent);

    var rules = parseRule(blocks);
    var simpleRules = parseBaseRule(blocks);
    var globalCmds = parseCmd(blocks, res);
    var props = res.props;

    rules = rules.concat(simpleRules);

    globalCmds.funcs.forEach(function(cmd){
        var name = cmd.func;
        var params = cmd.params;
        var fun = cmdFuncs[name];
        var context = res;

        if(typeof fun === 'function'){
            fun.apply(context, params)
        }else{
            log.error('unknow global command', name.bold.yellow);
        }
    });

    rules.forEach(function(rule){
        rule.source = rule.source.replace(/\$[\w\d_]+/g, function(match){
            return (match in props) ? props[match] : match
        });

        delete rule.commands;

        res[rule.source] = rule;
    });

    log.debug(JSON.stringify(res));

    return res
};

function parseBlock(pureContent){
    var blocks = {
        base_rule: [],
        rule: [],
        cmd: []
    };
    // var types = ['rule', 'base_rule', 'cmds'];
    var fullreg = /(.*?\s*=>\s*\{[\s\S]*?\})|(.*?\s*=>\s*[^\{\}\n\r;]*)|(\w+(?:\s+[^\n\r;]+)+)/g;

    pureContent.replace(fullreg, function(match, rule, base_rule, cmd){
        if(rule) blocks.rule.push(rule);
        if(base_rule) blocks.base_rule.push(base_rule);
        if(cmd) blocks.cmd.push(cmd);

        // if(cmd){
        //     console.log('cmddddd= >>>', cmd);
        // }
        //
        // if(base_rule){
        //     console.log('base_ruledddd= >>>', base_rule);
        // }
        //
        // if(rule){
        //     console.log('ruledddd= >>>', rule);
        // }
    });

    return blocks
}

function parseBaseRule(blocks){
    var reg = /^(.*?)\s*=>\s*([^\{\}\n\r]*)$/;
    var baseRules = [];
    var result;
    
    blocks.base_rule.forEach(function(baseRule){
        result = baseRule.match(reg);
        baseRules.push({
            source: result[1].trim(),
            props: {
                proxy: [result[2].trim().replace(/;$/, '')]
            }
        })
    });

    // console.log('============================================');
    // console.log(JSON.stringify(baseRules, null, 4));
    // console.log('total', baseRules.length, 'base rules');
    // console.log('============================================');

    return baseRules;
}

function parseRule(blocks){
    var reg = /(.*?)\s*=>\s*\{([\s\S]*?)\}/;
    var rules = [];
    var result;

    blocks.rule.forEach(function(rule){
        result = rule.match(reg);
        rules.push({
            source: result[1],
            commands: result[2].trim()
        })
    });

    rules.forEach(function(rule){
        // var source = rule.source;
        var commands = rule.commands.split(/\n\r?/);

        parseCmd({
            cmd: commands
        }, rule);
    });

    // console.log('============================================');
    // console.log(JSON.stringify(rules, null, 4));
    // console.log('total', rules.length, 'rules');
    // console.log('============================================');

    return rules;
}

function parseCmd(blocks, target){
    target = target || {};

    if(!target.funcs) target.funcs = [];
    if(!target.props) target.props = {};

    blocks.cmd.forEach(function(cmd){
        cmd = cmd.trim().replace(/;\s*$/, '');

        if(!cmd){
            return
        }

        var tokens = cmd.split(/\s+/);
        var command, params;

        if(tokens && tokens.length){
            command = tokens[0];
            params = tokens.slice(1);

            if(FUNC_CMD.indexOf(command) !== -1){
                target.funcs.push({
                    func: command,
                    params: params
                })
            }else if(PROP_CMD.indexOf(command) !== -1){
                target.props[command] = params;
            }else{
                console.log('[error] unexpected command', command);
            }
        }
    });

    return target
}

// test
// require(__dirname + '/../global');
// var rules = module.exports(__dirname + '/example/rewrite');