/**
 * @file rewrite指令
 * @author zdying
 */

module.exports = {
    // ## proxy request config
    'proxy_set_header': function(key, value){
        log.debug('proxy_set_header -', this, key, value);
        this.request.headers[key] = value;
    },
    'proxy_hide_header': function(key, value){
        log.debug('proxy_del_header -', this, key, value);
        delete this.request.headers[key];
    },
    'proxy_set_cookie': function(key, value){
        log.debug('proxy_set_cookie -', this, key, value);
        log.info('proxy_set_cookie will comeing soon');
        // var str = key + '=' + value;
        // if(this.request.cookie){
        //     this.request.cookie += (' ;' + str);
        // }else{
        //     this.request.cookie = str;
        // }
    },
    'proxy_hide_cookie': function(key){
        log.debug('proxy_hide_cookie -', this, key);
        log.info('proxy_hide_cookie will comeing soon');
        // var cookie = this.request.cookie || this.request.Cookie;
        // var str = key + '=.+?; ';
        //
        // if(cookie){
        //     // this.request.cookie = (cookie + '; ').replace(new RegExp(str, 'g'), '').replace(/; $/, '')
        //     this.request.Cookie = 'abcd=dddd';
        // }
    },

    // ## response config
    'hide_cookie': function(key){
        this.response.headers['Set-Cookie'] = key + '=; Expires=' + new Date(1);
    },
    'hide_header': function(key, value){
        log.debug('hide_header -', this, key, value);
        delete this.response.headers[key];
    },
    'set_header': function(key, value){
        log.debug('set_header -', this, key, value);
        this.response.headers[key] = value;
    },
    'set_cookie': function(key, value){
        log.debug('set_cookie -', this, key, value);
        this.response.headers['Set-Cookie'] = key + '=' + value;
    },

    //TODO remove proxy and use proxy_pass
    proxy: function(value){
        this.props.proxy = value;
    },

    proxy_pass: function(value){
        this.props.proxy = value;
    },

    // global commands
    'set': function(key, value){
        this.props[key] = value;
    }
};