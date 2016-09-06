/**
 * @file Format AST tree to object that is easy to use
 * @author zdying
 */

var commandFuncs = require('./commands');

module.exports = function formatAST(ASTTree){
    var res = {
        funcs: [],
        props: {}
    };
    
    var baseRules = ASTTree.baseRules || [];
    var domains = ASTTree.domains || [];
    var commands = ASTTree.commands || [];

    var globalFuncs = res.funcs = parseCommand(commands);

    //TODO 处理变量里面使用变量的情况
    globalFuncs.forEach(function(func){
        var context = res;
        commandFuncs[func.name].apply(context, func.params);
    });

    //TODO invoke global commands

    baseRules.forEach(function(rule){
        var arr = rule.split(/\s*=>\s*/);
        var source = arr[0];
        var target = arr[1];

        //TODO replace var in source
        res[source] = {
            source: source,
            props: {
                proxy: target
            }
        };
    });

    domains.forEach(function(domain){
        var _domain = domain.domain;
        var location = domain.location;

        if(!Array.isArray(location) || location.length === 0){
            var funcs = parseCommand(domain.commands || []);
            res[_domain] = {
                source: _domain,
                commands: funcs,
                props: {}
            };
            return
        }

        location.forEach(function(loc){
            var url = _domain + loc.location;
            var funcs = parseCommand(loc.commands || []);

            res[url] = {
                source: url,
                commands: funcs,
                props: {}
            }
        })
    });

    return res
};

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

//test
var AST = require('./AST');
var ASTTree = AST(__dirname + '/example/rewrite');
var formatedTree = module.exports(ASTTree);

console.log(':::formated tree:::');
console.log(JSON.stringify(formatedTree, null, 4));