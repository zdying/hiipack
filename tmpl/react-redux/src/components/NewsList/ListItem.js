/**
 * @file
 * @author zdying
 */

import React, {Component} from 'react';

import MdStarOutline from 'react-icons/lib/md/star-outline';
import MdStar from 'react-icons/lib/md/star';

import './newslistitem.less';

export default class ListItem extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        var props = this.props;
        var item = props.item;
        var onUnStar = props.onUnStar || this.onUnStar;
        var onStar = props.onStar || this.onStar;
        var onClick = props.onClick || this.onClick;

        return (
            <li key={'item-' + item.id} data-id={item.id} className="news-item" onClick={()=>{onClick(item.id)}}>
                {item.image ? <img className="item-img" src={item.image}/> : null}
                <div className="item-info">
                    <div className="item-title">{item.title}</div>
                    <div className="item-subtitle">
                        <div className="item-date">{item.time}</div>
                        <div className="item-classify">[{item.classify}]</div>
                        <div className="item-icons">
                            {
                                item.isStar
                                ? <MdStar className="icon" onClick={(e)=>{
                                        e.stopPropagation();
                                        onUnStar();
                                  }} />
                                : <MdStarOutline className="icon" onClick={(e)=>{
                                        e.stopPropagation();
                                        onStar();
                                  }} />
                            }
                        </div>
                    </div>
                </div>
            </li>
        )
    }

    onStar(index){
        console.warn('[warning] [index=' + index +'] onStar action is empty.');
    }

    onUnStar(index){
        console.warn('[warning] [index=' + index +'] onUnStar action is empty.');
    }

    onClick(id){
        console.warn('[warning] [id=' + id +'] onClick action is empty.');
    }
}

ListItem.propTypes = {
    /**
     * 列表数据
     */
    item: React.PropTypes.object.isRequired,
    /**
     * star回调
     */
    onStar: React.PropTypes.func,
    /**
     * unstar回调
     */
    onUnStar: React.PropTypes.func,
    /**
     * 列表项被点击的回调
     */
    onClick: React.PropTypes.func
}