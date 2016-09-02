/**
 * @file
 * @author zdying
 */
require('../src/global');
var fixAlias = require('../src/webpackConfig/utils/fixAlias');

var assert = require('assert');

describe('fixAlias',function(){
    var alias = {
        'root': 'src/',
        'component': '/src/component'
    };

    it('去掉末尾的`/`', function(){
        var fixed = fixAlias(alias);
        assert(JSON.stringify(alias) === JSON.stringify(fixed))
    });
});