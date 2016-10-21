# hiipack

[![NPM version](https://img.shields.io/npm/v/hiipack.svg?style=flat)](https://www.npmjs.org/package/hiipack)

hiipack is a front end development tool based on webpack.


  Install:
  
    npm install hiipack -g

  Usage: 
    
    hii [options] [command]
  
  
  Commands:
  
      init <name>                   initialize project
      start                         create a local server
      min                           compress/obfuscate project files
      pack                          pack project files
      sync                          synchronize the current directory to remote server
      test                          run unit test
      clear                         clear resulting folders of hiipack
      config [operation] [args...]  hiipack config, `operation`: [empty]|list|set|delete
  
   Options:
  
      -h, --help                 output usage information
      -v, --version              output the version number
      -o, --open [open]          open in browser, one of: chrome|firefox|safari|opera
      -p, --port <port>          service port
      -r, --registry <registry>  npm registry address
      -d, --debug                print debug log
      -s, --syncConf <syncConf>  custom sync config
      -D, --detail               print debug and error detail log
      -x, --proxy                start the proxy server
      -t, --type <type>          project type: one of react|react-redux|es6|vue|normal|empty
      --no-color                 disable log color
  
  Examples:
  
      $ hii init project_name
      $ hii start
      $ hii start -p 8800
      $ hii pack
      $ hii sync
      $ hii min

  Documention:

  [Documention](https://zdying.gitbooks.io/hiipack_doc/content/)