/**
 * @file
 * @author zdying
 */

'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');

var parseHosts = require('../src/proxy/tools/parseHosts');

describe('proxy rewrite',function(){
    var formatAST = require('../src/proxy/AST/ASTFormater');
    var AST = require('../src/proxy/AST/AST');

    it('正确解析AST', function(){
        var sourceCode = fs.readFileSync(__dirname + '/proxy/rewrite.example');
        // var sourceCode = fs.readFileSync(__dirname + '/proxy/rewrite1');
        var rules = AST(sourceCode);

        var target = require('./proxy/ASTTree.result');

        assert(JSON.stringify(rules) === JSON.stringify(target))
    });

    it('正确解析格式化AST Tree', function(){
        var sourceCode = fs.readFileSync(__dirname + '/proxy/rewrite1');
        var rules = AST(sourceCode);
        var formatedTree = formatAST(rules);

        var target = require('./proxy/formatedASTTree.result');

        assert(JSON.stringify(formatedTree) === JSON.stringify(target))
    });

});