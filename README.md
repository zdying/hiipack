# hiipack

hiipack is a front end development tool based on webpack.


  Install:
  
    npm install hiipack -g


  Usage: 
  
    cli [options] [command]


  Commands:

    init <name>  初始化一个项目
    start        创建本地服务器
    build        压缩/混淆项目文件
    pack         合并项目文件
    sync         同步/上传当前目录至远程服务器

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    -p, --port [port]  server port
    -t, --type <type>  project type

  Examples:

    $ hii init project_name
    $ hii start
    $ hii start -p 8800
    $ hii pack
    $ hii sync
    $ hii build
    
  Wiki:
  
  [Wiki](https://github.com/zdying/hiipack/wiki/hiipack-wiki)