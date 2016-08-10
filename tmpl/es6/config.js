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
    library: {},
    /**
     * 业务代码入口
     */
    entry: {
        bundle: 'src/js/app.js'
    },
    /**
     * 别名
     */
    alias: {
        'root': 'src/'
    }
};