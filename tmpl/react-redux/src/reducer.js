/**
 * @file
 * @author zdying
 */

import {combineReducers} from 'redux';

import detailReducer from './pages/Detail/reducer';
import HomeReducer from './pages/Home/reducer';

const reducer = combineReducers({
    detail: detailReducer,
    list: HomeReducer
});
export default reducer;