/**
 * @file
 * @author zdying
 */

'use strict';
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var SSL_ROOT = path.join(__dirname, '../../ssl');

module.exports = {
    'ssl-path': function(){
        console.log(SSL_ROOT);
    },

    /**
     * 创建Root CA证书
     * @param caName
     */
    'create-root-ca': function(caName){
        var _path = path.join(SSL_ROOT, 'root');
        var keyPath = path.join(_path, caName + '.key');
        var pemPath = path.join(_path, caName + '.pem');

        if(fs.existsSync(keyPath) && fs.existsSync(pemPath)){
            console.log('Root CA `' + caName + '` already exists.');
        }else{
            child_process.execSync('openssl genrsa -out ' + keyPath + ' 2048');
            child_process.execSync(
                'openssl req -x509 -new -nodes -key ' + keyPath + ' -sha256 -days 3650 -out ' + pemPath,
                {
                    stdio: "inherit",
                    stdin: process.stdin,
                    stdout: process.stdout
                }
            );
        }

        console.log('\n\n');
        console.log('Root CA created success, file name: ' + (caName + '.key & ' + caName + '.pem').bold.green);
        console.log('\n\n');

        openFinder(_path);
    },

    /**
     * 创建单域名证书
     * @param domain
     * @param caName
     */
    'create-cert': function(domain, caName){
        caName = caName || 'HiipackCA';

        var caFileName = path.join(SSL_ROOT, 'root', caName);
        var domainFileName = path.join(SSL_ROOT, 'cert', domain);

        var keyPath = domainFileName + '.key';
        var crtPath = domainFileName + '.crt';
        var csrPath = domainFileName + '.csr';

        var caKeyPath = caFileName + '.key';
        var caPemPath = caFileName + '.pem';

        if(fs.existsSync(keyPath) && fs.existsSync(crtPath)){
            console.log('The certificate for `' + domain + '` already exists.');
            return;
        }

        if(!fs.existsSync(caPemPath) || !fs.existsSync(caKeyPath)){
            this['create-root-ca'](caName);
        }

        var privateKeyCMD = ['openssl genrsa -out', keyPath, '2048'].join(' ');
        var csrCMD = ['openssl req -new -key', keyPath, '-out', csrPath].join(' ');
        var certCMD = [
            'openssl x509 -req -in', csrPath, '-CA', caPemPath, '-CAkey', caKeyPath,
            '-CAcreateserial -out', crtPath,
            '-days 500 -sha256'
        ].join(' ');

        log.info('[step 1] create private key:'.bold.green, privateKeyCMD.bold);
        child_process.execSync(privateKeyCMD);

        log.info('[step 2] generate the certificate signing request:'.bold.green, csrCMD.bold);
        child_process.execSync(
            csrCMD,
            {
                stdio: "inherit",
                stdin: process.stdin,
                stdout: process.stdout
            }
        );

        log.info('[step 3] sign the CSR:'.bold.green, certCMD.bold);
        child_process.execSync(
            certCMD
        );

        console.log('\n\n');
        console.log('Root CA created success, file name: ' + (domain + '.key & ' + domain + '.pem').bold.green);
        console.log('\n\n');

        var _path = path.join(SSL_ROOT, 'cert');

        openFinder(_path);
    }
};

function openFinder(_path){
    var os = require('os');

    if(os.platform() === 'win32'){
        child_process.exec('start "" "' + _path + '"');
    }else{
        child_process.exec('open ' + _path);
    }
}