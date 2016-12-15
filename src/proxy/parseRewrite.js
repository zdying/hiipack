/**
 * @file parse rewrite file to javascript object
 * @author zdying
 */
var fs = require('fs');
var AST = require('./AST');
var formatAST = require('./ASTFormater');

module.exports = function parseRewrite(filePath){
    var sourceCode = fs.readFileSync(filePath);
    var ASTTree = AST(sourceCode);
    var tree = formatAST(ASTTree);

    // console.log('tree:::', tree);

    return tree
};