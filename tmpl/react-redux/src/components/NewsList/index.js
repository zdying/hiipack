/**
 * @file
 * @author zdying
 */

import React, {Component} from 'react';

import MdRefresh from 'react-icons/lib/md/autorenew';

import ListItem from './ListItem';

import './newslist.less';

export default class NewsList extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let props = this.props;
        let fetchState = props.fetchState;
        let tipsNode = null;

        // fetchState = 'fetching';
        //TODO tips相关的搞成一个组件
        switch (fetchState) {
            // 定义成常量
            case 'fetching':
                tipsNode = (
                    <div className="tips">
                        <MdRefresh className="loading" />
                        <span>正在加载...</span>
                    </div>);
                break;

            case 'error':
                tipsNode = <div className="tips">加载失败, 请稍后再试.</div>;
                break;

            case 'initial':
                tipsNode = <div className="tips">正在初始化, 请稍后...</div>;
                break;
        }

        if (tipsNode) {
            return <div className="m-news-list">{tipsNode}</div>
        } else {
            if (props.list.length < 1) {
                return <div>暂时还没有新闻信息.</div>
            }
        }
        
        let listDOM = this.props.list.map((item, index) => {
            if (item.content)
                return (
                    <ListItem
                        key={"list-item-" + index}
                        item={item}
                        onUnStar={()=>this.props.onUnStar(index)}
                        onStar={()=>this.props.onStar(index)}
                        onClick={(id)=>this.props.onItemClick(id)}
                    />
                )
        });

        return (
            <div className="m-news-list">
                <ul className="list">{listDOM}</ul>
            </div>
        )
    }
}

NewsList.propTypes = {
    /**
     * 数据加载状态
     */
    fetchState: React.PropTypes.oneOf(['fetching', 'error', 'initial', 'fetched']),
    /**
     * 数据列表
     */
    list: React.PropTypes.array.isRequired,
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
    onItemClick: React.PropTypes.func
};