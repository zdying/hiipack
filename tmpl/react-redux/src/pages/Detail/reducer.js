/**
 * @file
 * @author zdying
 */

const initState = {
    fetchState: 'initial',
    detail: {
        content: '',
        title: ''
    },
    msg: ''
};

import * as Actions from './action';

export default function doClick(state=initState, action) {
    switch(action.type){
        case Actions.UPDATE_CONTENT:
            return Object.assign({}, state, {
                detail: action.data
            });
            break;

        case Actions.CHANGE_DETAIL_FETCH_STATE:
            return Object.assign({}, state, {
                fetchState: action.fetchState
            });
            break;

        default:
            return state
    }
}