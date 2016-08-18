# hiipack

hiipack is a front end development tool based on webpack.


  Install:
  
    npm install hiipack -g

  Usage: hii [options] [command]


  Commands:

    init <name>  initialize project
    start        create a local server
    min          compress/obfuscate project files
    pack         pack project files
    sync         synchronize the current directory to remote server
    test         run unit test
    clear        clear resulting folders of hiipack

  Options:

    -h, --help                 output usage information
    -V, --version              output the version number
    -o, --open                 open in browser
    -p, --port <port>          service port
    -r, --registry <registry>  npm registry address
    -t, --type <type>          project type: one of react|react-redux|es6|vue|normal|empty

  Examples:

    $ hii init project_name
    $ hii start
    $ hii start -p 8800
    $ hii pack
    $ hii sync
    $ hii min

    
  Wiki:
  
  [Wiki](https://github.com/zdying/hiipack/wiki/hiipack-%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E)