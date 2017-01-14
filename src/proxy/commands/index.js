/**
 * @file rewrite指令
 * @author zdying
 */

var path = require('path');

module.exports = {
    // proxy request config
    'proxy_set_header': function(key, value){
        log.debug('proxy_set_header -', key, value);
        this.request.headers[key] = value;
    },
    'proxy_hide_header': function(key, value){
        log.debug('proxy_del_header -', key, value);
        delete this.request.headers[key];
    },
    'proxy_set_cookie': function(key, value){
        log.debug('proxy_set_cookie -', key, value);
        
        var str = key + '=' + value;
        var headers = this.request.headers;
        var cookie = headers.cookie || '';

        headers.cookie = cookie + '; ' + str;
    },
    'proxy_hide_cookie': function(key){
        log.debug('proxy_hide_cookie -', key);

        var headers = this.request.headers;
        var cookie = headers.cookie;

        headers.cookie = cookie.replace(new RegExp('(;.*)?' + key + '\s*=\s*([^;]*)\s*'), '')
    },

    // response config
    'hide_cookie': function(key){
        this.response.headers['Set-Cookie'] = key + '=; Expires=' + new Date(1);
    },
    'hide_header': function(key, value){
        log.debug('hide_header -', key, value);
        delete this.response.headers[key];
    },
    'set_header': function(key, value){
        log.debug('set_header -', key, value);
        this.response.headers[key] = value;
    },
    'set_cookie': function(key, value){
        log.debug('set_cookie -', key, value);
        this.response.headers['Set-Cookie'] = key + '=' + value;
    },

    // location commands
    'proxy_pass': function(value){
        this.props.proxy = value;
    },
    'alias': function(value) {
        if(/^\//.test(value)){
            this.props.proxy = value;
            this.props.alias = true;
        }else{
            log.error('`alias`'.bold + "'s value should be an absolute path.");
        }
    },
    'root': function(value){
        this.props.default = value;
    },

    // domain commands
    'ssl_certificate': function(value){
        var global = this.parent;
        var rewriteFilePath = global.filePath;
        var dirname = path.dirname(rewriteFilePath);

        this.props.sslCertificate = path.join(dirname, value);
    },

    'ssl_certificate_key': function(value){
        var global = this.parent;
        var rewriteFilePath = global.filePath;
        var dirname = path.dirname(rewriteFilePath);

        this.props.sslCertificateKey = path.join(dirname, value);
    },

    // global commands
    'set': function(key, value){
        this.props[key] = value;
    }
};
