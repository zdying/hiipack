# hiipack

hiipack is a front-end development tool based on the Webpack.

[![webpack](https://img.shields.io/badge/hiipack-%20based%20on%20webpack%20-green.svg?style=flat)](https://webpack.github.io/)
[![Node.js version](https://img.shields.io/badge/node-%3E%3D0.12.7-orange.svg)](https://nodejs.org/)
[![NPM version](https://img.shields.io/npm/v/hiipack.svg?style=flat)](https://www.npmjs.org/package/hiipack)
[![npm](https://img.shields.io/npm/dm/hiipack.svg)](https://www.npmjs.com/package/hiipack)
[![Build Status](https://travis-ci.org/zdying/hiipack.svg?branch=master)](https://travis-ci.org/zdying/hiipack)

hiipack is a front-end development tool based on the Webpack, it simplifies the Webpack configuration so that you can easily build a project.
It provides code pack, compression, synchronization and other functions.
hiipack also provides a local development service, can run multiple projects simultaneously.
In addition, hiipack also has a built-in proxy server can fulfill the request forwarding, 
including the mutual conversion between HTTP and HTTPS proxy.

## Screenshot
    
1. Development server
![hiipack development server](http://i.imgur.com/0cMSrm0.gif)

2. Pack and Min
![hiipack pack and min command](http://i.imgur.com/ilvd35M.gif)

3. Proxy server

## Features

* Local development service
* Code pack
* Compress/uglify
* Sync code to remote server
* Easy to configure
* Built-in proxy
* Built-in Hosts
* Built-in proxy config (Similar to nginx configuration file syntax)
* HTTPS support
* Easy to create https certificate

## Install

```bash
npm install hiipack -g
```

### Usage
    
```bash
hii [options] [command]
``` 
  
## Commands
  
```bash
init <name>                   initialize project
start                         create a local server
min                           compress/uglify project files
pack                          pack project files
local <project>               pack local project files
sync                          synchronize the current directory to remote server
test                          run unit test
clear                         clear resulting folders of hiipack
config [operation] [args...]  hiipack config, `operation`: [empty]|list|set|delete
ssl [operation] [args...]     ssl certificate manage, `operation`: [empty]|create-root-ca|ssl-path
```
  
## Options
  
```bash
-h, --help                  output usage information
-v, --version               output the version number
-o, --open [open]           open in browser, one of: chrome|firefox|safari|opera
-p, --port <port>           service port
-r, --registry <registry>   npm registry address
-d, --debug                 print debug log
-s, --sync-conf <syncConf>  custom sync config
-D, --detail                print debug and error detail log
-x, --proxy                 start the proxy server
-t, --type <type>           project type: one of react|react-redux|es6|vue|normal|empty
--no-color                  disable log color
--no-hot-reload             disable hot reload
--log-time                  display log time
--https                     start https server
--proxy-port <proxyPort>    proxy server port
--ssl-key <sslKey>          ssl key file
--ssl-cert <sslCert>        ssl cert file
--ca-name <caName>          CA name, for command: `ssl create-cert`|`ssl create-root-ca`
--sub-domains <subDomains>  sub domians, for command: `ssl create-cert`
```

## Get Start

#### Create project

```bash
hii init project_name -t es6 # use es6 project template
```

#### Start local development server

```bash
hii start -xo --https -p 9000 # start proxy server, open browser, enable https, port 9000
```

#### Preview in browser

After you execute the above command, hiipack will open a browser window and set up the proxy,
this window is independent of other browser window, so only this browser window's request through the proxy server.

#### Coding...

Now, you can start to enjoy writing your code :)

#### Build beta version code

```bash
cd project_name
hii pack
```

#### Build production version code

```bash
cd project_name
hii min
```

#### Sync your beta version to remote server

```bash
hii sync
```

**Note**: you can config the remote server, default config file is `dev.json`.


## Examples

```bash
$ hii init project_name -t es6

$ hii start -xodD --https --ssl-cert ssl/cert/file --ssl-key ssl/key/file
$ hii start -p 8800

$ hii pack -dD --log-time --no-color
$ hii sync
$ hii min -dD --log-time

$ hii config list
$ hii config set system_proxy xxx.yyy.zzz:25
$ hii config delete system_proxy

$ hii ssl create-root-ca RootCAName
$ hii ssl create-cert www.example.com --ca-name RootCAName
```

## Documention

  [Documention](https://zdying.gitbooks.io/hiipack_doc/content/)