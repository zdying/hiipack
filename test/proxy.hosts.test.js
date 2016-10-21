/**
 * @file
 * @author zdying
 */

'use strict';

var assert = require('assert');
var path = require('path');

var parseHosts = require('../src/proxy/parseHosts');

describe('proxy hosts',function(){
    it('正确解析hosts文件', function(){
        var hostsObj = parseHosts(path.resolve(__dirname, 'proxy/hosts.example'));
        var target = {
            'hiipack.com': '127.0.0.1:8800',
            'hii.com': '127.0.0.1:8800',
            'example.com': '127.0.0.1',
            'example.com.cn': '127.0.0.1'
        };

        assert(JSON.stringify(hostsObj) === JSON.stringify(target))
    });
});