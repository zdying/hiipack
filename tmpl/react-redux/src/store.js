/**
 * @file
 * @author zdying
 */

import {createStore} from 'redux';

import reducer from './reducer';

let store = createStore(reducer, {},
    // 使用Redux-devtool必须要加入下面这一行代码
    window.devToolsExtension ? window.devToolsExtension() : undefined);

export default store;