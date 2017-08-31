/**
 * @file
 * @author zdying
 */

import React from 'react';
import ReactDom, {render} from 'react-dom';
import { Router, Route, Link, hashHistory } from 'react-router';

import {Provider} from 'react-redux';

import Home from './pages/Home';
import Detail from './pages/Detail';

import store from './store';

render(
    <Provider store={store}>
        <Router history={hashHistory}>
            <Route path="/" component={Home} title="内幕新闻" />
            <Route path="/detail/:id" component={Detail} />
        </Router>
    </Provider>,
    document.getElementById('app')
);
