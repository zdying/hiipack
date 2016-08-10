/**
 * @file
 * @author zdying
 */

export const UPDATE_CONTENT = 'UPDATE_CONTENT';
export function updateData(content) {
    return {
        type: UPDATE_CONTENT,
        data: content || {content: ''}
    }
}

export const CHANGE_DETAIL_FETCH_STATE = 'CHANGE_DETAIL_FETCH_STATE';
export function changeFetchState(state){
    return {
        type: CHANGE_DETAIL_FETCH_STATE,
        fetchState: state
    }
}

// Tools
export function fetchData(dispatch, id) {
    let url = './mock/list.json';

    dispatch(changeFetchState('fetching'));

    fetch(url)
        .then(response => response.json())
        .then(json => {
            if(json.ret){
                setTimeout(function(){
                    var data = json.data;

                    dispatch(changeFetchState('fetched'));
                    dispatch(updateData(data[id]))
                }, 1000);
            }else{
                dispatch(changeFetchState('error'));
                dispatch(doFetchError(json.message))
            }
        })
}