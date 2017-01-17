/**
 * @file
 * @author zdying
 */

'use strict';
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var SSL_ROOT = path.join(__dirname, '../../ssl');
var ROOT_CA_CONF = path.join(SSL_ROOT, 'root_ca.cnf');
var DOMAIN_CERT_CONF = path.join(SSL_ROOT, 'domain_cert.cnf');
var DOMAIN_CERT_SAN_CONF = path.join(SSL_ROOT, 'domain_cert_san.cnf');

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
                [
                    'openssl req -x509 -new -nodes -sha256 -days 3650',
                    '-key ' + keyPath,
                    '-out ' + pemPath,
                    // '-config ' + ROOT_CA_CONF
                ].join(' '),
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
     * @param fileName
     * @param caName
     */
    'create-cert': function(fileName){
        var caName = program.caName || 'HiipackCA';
        var subDomains = program.subDomains || '';
        var domains = subDomains ? subDomains.split(/\s*,\s*/) : [];
        var caFileName = path.join(SSL_ROOT, 'root', caName);
        var domainFileName = path.join(SSL_ROOT, 'cert', fileName);

        var keyPath = domainFileName + '.key';
        var crtPath = domainFileName + '.crt';
        var csrPath = domainFileName + '.csr';

        var caKeyPath = caFileName + '.key';
        var caPemPath = caFileName + '.pem';

        var isSAN = domains.length > 1;
        var domainConf = isSAN ? '' : DOMAIN_CERT_CONF;

        if(fs.existsSync(keyPath) && fs.existsSync(crtPath)){
            console.log('The certificate for `' + fileName + '` already exists.');
            return;
        }

        if(!fs.existsSync(caPemPath) || !fs.existsSync(caKeyPath)){
            this['create-root-ca'](caName);
        }

        if(isSAN){
            var sanConf = fs.readFileSync(DOMAIN_CERT_SAN_CONF);
            var altNamesStr = getAltNames(domains);

            domainConf = path.join(SSL_ROOT, fileName + '_tmp_conf.cnf');

            fs.writeFileSync(domainConf, sanConf + altNamesStr);
        }

        var privateKeyCMD = ['openssl genrsa -out', keyPath, '2048'].join(' ');
        var csrCMD = ['openssl req -new -key', keyPath, '-out', csrPath, '-config', domainConf].join(' ');
        var certCMD = [
            'openssl x509 -req -in', csrPath, '-CA', caPemPath, '-CAkey', caKeyPath,
            '-CAcreateserial -out', crtPath,
            '-days 500 -sha256',
            isSAN ? '-extensions v3_req -extfile ' + domainConf : ''
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
        console.log('Root CA created success, file name: ' + (fileName + '.key & ' + fileName + '.pem').bold.green);
        console.log('\n\n');

        var _path = path.join(SSL_ROOT, 'cert');

        openFinder(_path);

        if(isSAN && domainConf !== DOMAIN_CERT_SAN_CONF){
            fs.unlink(domainConf);
        }
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

function getAltNames(domains){
    var dns = [];
    var ip = [];
    var ipReg = /^(\d{1,3}\.){3}(\d{1,3})$/;

    domains.forEach(function(domain){
        if(ipReg.test(domain.trim())){
            ip.push('IP.' + (ip.length + 1) + ' = ' + domain);
        }else{
            dns.push('DNS.' + (dns.length + 1) + ' = ' + domain);
        }
    });

    return '\n' + dns.concat(ip).join('\n');
}