/**
 * @file
 * @author zdying
 */

'use strict';

module.exports = function(source, map) {
    // console.log(this);
    if (this.cacheable) {
        this.cacheable();
    }

    if (!module.hot || /\bmodule\.hot\b/.test(source)) {
        return source;
    }

    return [
        source,
        '',
        'module.hot.accept(function(err) {',
        '    if (err) {',
        '        console.error(err);',
        '    }',
        '});'
    ].join('\n');
};
