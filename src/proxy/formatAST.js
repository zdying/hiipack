/**
 * @file Format AST tree to object that is easy to use
 * @author zdying
 */

var commandFuncs = require('./commands');
var merge = require('../helpers/merge');
var type = require('../helpers/type');

var scopeCmds = {
    domain : ['set'],
    global : ['set'],
    location : ['set', 'proxy']
};

// var requestScopeCmds = [];
// var responseScopeCmds = [];

module.exports = function formatAST(ASTTree){
    var res = {
        commands: [],
        props: {}
    };
    
    var baseRules = ASTTree.baseRules || [];
    var domains = ASTTree.domains || [];
    var commands = ASTTree.commands || [];

    var globalFuncs = res.commands = parseCommand(commands);

    // step 1: 执行全局命令(比如: `set $domain example.com`)
    execCommand(globalFuncs, res, 'global');

    // step 1.1: 替换全局变量中的变量
    replaceVar(res.props, res.props);

    // step 2: 解析基本规则(比如: `example.com => other.com`)
    baseRules.forEach(function(rule){
        var arr = rule.split(/\s*=>\s*/);
        var source = arr[0];
        var target = arr[1];
        var globalProps = res.props;

        // step 3: 替换基本规则中的变量
        source = replaceVar(source, globalProps);
        target = replaceVar(target, globalProps);

        res[source] = {
            source: source,
            props: {
                proxy: target
            }
        };
    });

    // step 4: 解析Domain(比如: `example.com = { ... }`)
    domains.forEach(function(domain){
        var _domain = domain.domain;
        var location = domain.location;
        var funcs = parseCommand(domain.commands || []);

        // step 5: 执行domain中的命令(比如: set $domain example.com)
        // 这里必须先执行命令, 然后在替换值
        // 这样才能保证domain里面的变量优先级高于上一级(全局)变量
        execCommand(funcs, domain, 'domain');

        // step 5.1: 替换domain规则中的变量

        // _domain属于顶层, 应该用上一层(全局)变量替换
        _domain = replaceVar(_domain, res.props);

        // domain中的变量, 属于domain, 用domain的变量和上一层变量替换
        replaceVar(domain.props, domain.props, res.props);

        // funcs里面的变量属于domain, 用domain的变量和上一层变量替换
        funcs.forEach(function(fun){
            var params = fun.params;
            var name = fun.name;

            if(name === 'set'){
                // 如果是 set 命令, 不替换第一个参数
                fun.params = [params[0]].concat(replaceVar(fun.params.slice(1), domain.props, res.props))
            }else{
                fun.params = replaceVar(fun.params, domain.props, res.props)
            }
        });

        // step 6: 如果没有location, 直接返回domain对象
        if(!Array.isArray(location) || location.length === 0){
            res[_domain] = {
                source: _domain,
                commands: funcs,
                props: domain.props
            };
            return
        }

        // step 7: 合并location
        location.forEach(function(loc){
            var url = _domain + loc.location;
            var proxy;
            var props;
            var funcs = parseCommand(loc.commands || []);

            // step 8: 执行location命令(比如: `set $domain example.com`)
            execCommand(funcs, loc, 'location');

            // step 9: 替换location变量, 作用域为domain和上层(res)
            url = replaceVar(url, domain.props, res.props);
            proxy = replaceVar(loc.props.proxy, domain.props, res.props);

            funcs.forEach(function(fun){
                var params = fun.params;
                var name = fun.name;

                if(name === 'set'){
                    // 如果是 set 命令, 不替换第一个参数
                    fun.params = [params[0]].concat(replaceVar(fun.params.slice(1), loc.props, domain.props, res.props))
                }else{
                    fun.params = replaceVar(fun.params, loc.props, domain.props, res.props)
                }

                // console.log('替换location的function参数:', name, fun.params);
            });

            props = merge({}, domain.props, {
                proxy: proxy
            });

            // 替换正则表达式
            url = url.replace(/(.*?)~\/(.*)/, '~ /$1$2');

            res[url] = {
                source: url,
                commands: funcs,
                props: props,
                location: loc
            }
        })
    });

    return res
};

function execCommand(funcs, context, scope){
    if(!Array.isArray(scopeCmds[scope])){
        log.error('invalid scope', scope.bold.yellow, '(not exists or not an array).');
    }else{
        var cmds = scopeCmds[scope];
        funcs.forEach(function(func){
            if(cmds.indexOf(func.name) !== -1){
                commandFuncs[func.name].apply(context, func.params);
            }else{
                // log.debug(func.name.bold.yellow, 'is not in the', scope, 'scope, skipped.')
            }
        });
    }
}

function parseCommand(commands){
    if(!Array.isArray(commands)){
        commands = [commands]
    }

    return commands.map(function(command){
        var array = command.split(/\s+/);
        return {
            name: array[0],
            params: array.slice(1)
        }
    });
}

/**
 * 替换字符串/字符串数组中的变量
 * @param {String|Array} str
 * @param {Object} source
 * @returns {*}
 */
function replaceVar(str, source/*, source1, source2*/){
    var strType = type(str);
    var sourceArr = [].slice.call(arguments, 1);
    var mapping = source;
    var replace = function(str){
        return str.replace(/\$[\w\d_]+/g, function(match){
            var val = mapping[match];
            return val ? val : match;
        });
    };

    if(type === 'null' || type === 'undefined'){
        return str
    }

    if(sourceArr.length > 1){
        mapping = {};
        sourceArr.forEach(function(item){
            if(item && typeof item === 'object'){
                for(var key in item){
                    if(!(key in mapping)){
                        mapping[key] = item[key]
                    }
                }
            }
        });
    }

    if(strType === 'string'){
        str = replace(str);
    }else if(strType === 'array'){
        str = str.map(function(string){
            return replace(string)
        })
    }else if(strType === 'object'){
        for(var key in str){
            str[key] = replace(str[key])
        }
    }

    return str;
}

function replaceProps(props, source/*, source1, source2*/){
    var sourceArr = [].slice.call(arguments, 1);

}

//test
// var fs = require('fs');
// var AST = require('./AST');
// var sourceCode = fs.readFileSync(__dirname + '/example/rewrite');
// var ASTTree = AST(sourceCode);
// var formatedTree = module.exports(ASTTree);
//
// console.log(':::formated tree:::');
// console.log(JSON.stringify(formatedTree, null, 4));

// var str = "$flight/abc => { set_cookie UserId $id }";
// var source1 = {
//     '$flight': 'flight.qunar.com',
//     '$id': 1
// };
// var source2 = {
//     '$id': 2
// };
//
// console.log(replaceVar(str, source1, source2));
// console.log(replaceVar(str, source1));