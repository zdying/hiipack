/**
 * @file
 * @author zdying
 */

'use strict';

var fun = function(){
    var a = {
        'default': 'abc',
        a: 1, b:2
    };

    console.log(a['default'] + a.a + a.b);
};

fun();