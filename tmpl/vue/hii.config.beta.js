/**
 * @file 项目配置
 * @author zdying
 */

module.exports = {
    extend: {
        module: {
            loaders: [
                {
                    // "vue-loader": function function_name(argument) {
                    //     return { test: /\.vue$/, loader: 'vue' }
                    // },
                    "vue-loader": { test: /\.vue$/, loader: 'vue' }
                }
            ]
        }
    }
};