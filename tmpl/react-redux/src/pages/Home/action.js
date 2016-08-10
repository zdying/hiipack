/**
 * @file
 * @author zdying
 */

// Actions
export const DO_CLICK = 'DO_CLICK';
export function doClick(count){
    return {
        type: DO_CLICK,
        count: count
    }
}

export const DO_FETCH_ERROR = 'DO_FETCH_ERROR';
export function doFetchError(msg){
    return {
        type: DO_FETCH_ERROR,
        msg: msg
    }
}

export const DO_STAR = 'DO_STAR';
export function doStar(index){
    return {
        type: DO_STAR,
        index: index
    }
}

export const DO_UNSTAR = 'DO_UNSTAR';
export function doUnStar(index){
    return {
        type: DO_UNSTAR,
        index: index
    }
}

export const CHANGE_FETCH_STATE = 'CHANGE_FETCH_STATE';
export function changeFetchState(state){
    return {
        type: CHANGE_FETCH_STATE,
        fetchState: state
    }
}


export const UPDATE_LIST = 'UPDATE_LIST';
export function updateList(list) {
    return {
        type: UPDATE_LIST,
        list: list
    }
}

// Tools
export function fetchList(dispatch) {
    let url = './mock/list.json';

    dispatch(changeFetchState('fetching'));

    fetch(url)
        .then(response => response.json())
        .then(json => {
            if(json.ret){
                setTimeout(function(){
                    var data = json.data;
                    var list = [];
                    var index = 0;

                    for(var i = 0; i < 12; i++){
                        index = Math.floor(Math.random() * data.length);
                        list.push(data.splice(index, 1)[0])
                    }

                    dispatch(changeFetchState('fetched'));
                    dispatch(updateList(list))
                }, 1000);
            }else{
                dispatch(changeFetchState('error'));
                dispatch(doFetchError(json.message))
            }
        })
}