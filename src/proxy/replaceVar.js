/**
 * @file
 * @author zdying
 */
'use strict';

var type = require('../helpers/type');

/**
 * 替换字符串/字符串数组中的变量
 * @param {String|Array} str
 * @param {Object} source
 * @returns {*}
 */
module.exports = function replaceVar(str, source){
    var strType = type(str);
    var allProps = {};
    var currObj = source;
    var props = null;

    var replace = function(str){
        if(typeof str !== 'string'){
            return str
        }
        
        return str.replace(/\$[\w\d_]+/g, function(match){
            var val = allProps[match];

            if(typeof val !== 'undefined'){
                // 替换首位的引号
                return val.replace(/^(['"])(.*)(\1)$/, "$2");
            }else{
                return match;
            }
        });
    };

    if(type === 'null' || type === 'undefined'){
        return str
    }

    while(currObj){
        props = currObj.props;

        if(type(props) === 'object'){
            for(var key in props){
                if(!(key in allProps)){
                    allProps[key] = props[key]
                }
            }
        }

        currObj = currObj.parent;
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
