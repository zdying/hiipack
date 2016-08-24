/**
 * @file 项目配置
 * @author zdying
 */

module.exports = {
    /**
     * 需要单独打包的第三方库
     * 例如: {lib: ['react', 'react-dom']}
     * 会把'react'和'react-dom'打包到lib.js
     */
    library: {
        lib: ['react', 'classnames']
    },
    /**
     * 业务代码入口
     */
    entry: {
        app: "src/js/mainApp.jsx",
    },
    /**
     * 别名
     */
    alias: {
        'root': 'src/'
    },
    /**
     * 静态文件(直接复制, 不做处理)
     */
    // statics: {
    //     from: 'src/static',
    //     to: 'statics'
    // }
};