/**
 * @file
 * @author zdying
 */

const initState = {
    fetchState: 'initial',
    msg: '',
    list: []
};

import * as Actions from './action';

export default function doClick(state=initState, action) {
    switch(action.type){
        case Actions.UPDATE_LIST:
            return Object.assign({}, state, {
                list: action.list
            });
            break;

        case Actions.CHANGE_FETCH_STATE:
            return Object.assign({}, state, {
                fetchState: action.fetchState
            });
            break;

        case Actions.DO_STAR:
            return Object.assign({}, state, {
                list: state.list.map((li, index)=>{
                    if(index === action.index){
                        return Object.assign({}, li, {
                            isStar: true
                        })
                    }else{
                        return li
                    }
                })
            });
            break;

        case Actions.DO_UNSTAR:
            return Object.assign({}, state, {
                list: state.list.map((li, index)=>{
                    if(index === action.index){
                        return Object.assign({}, li, {
                            isStar: false
                        })
                    }else{
                        return li
                    }
                })
            });
            break;

        default:
            return state
    }
}