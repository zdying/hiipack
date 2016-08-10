/**
 * @file
 * @author zdying
 */

import React from 'react';
import {connect} from 'react-redux';

import MdArrowBack from 'react-icons/lib/md/arrow-back';
import MdRefresh from 'react-icons/lib/md/refresh';

import * as Actions from './action';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

import './detail.less';

export class Detail extends React.Component{
    constructor(props){
        super(props);

        this.refresh = this.refresh.bind(this);
        this.clear = this.clear.bind(this);
        this.back = this.back.bind(this);
    }

    componentWillMount(){
        this.refresh();
    }

    componentWillUnmount(){
        console.log('[log] clear().');
        this.clear();
    }

    render(){
        let props = this.props;
        let detail = props.detail;
        let fetchState = props.fetchState;
        let tipsNode = null;
        let html = null;

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


        if (!tipsNode) {
            if(props.msg){
                tipsNode = <div className="tips">{msg}</div>
            }else{
                html = {__html: '<p>' + (detail.content || '').replace(/\n/g, '</p><p>') + '</p>'};
                tipsNode = <div dangerouslySetInnerHTML={html} />
            }
        }

        return (
            <div className="m-detail-page">
                <Header
                    leftButton={<MdArrowBack className="icon" onClick={this.back} />}
                    title="新闻内容"
                    onLeftButtonClick={this.refresh}
                />

                <div className="content">
                    <h1>{detail.title}</h1>
                    <div className="info">
                        <span>{detail.time}</span>
                        <span>{detail.classify}</span>
                    </div>
                    {tipsNode}
                </div>
                <Footer />
            </div>
        )
    }

    refresh(){
        Actions.fetchData(this.props.dispatch, this.props.params.id)
    }

    clear(){
        this.props.dispatch(Actions.updateData({content: '', title: ''}))
    }

    back(){
        // this.props.history.goBack();
        this.context.router.goBack()
    }
}

function mapStateToProps(state) {
    let {
        detail,
        fetchState,
        msg
    } = state.detail;

    return {
        detail,
        fetchState,
        msg
    }
}

export default connect(mapStateToProps)(Detail);

Detail.propTypes = {
    /**
     * 数据加载状态
     */
    fetchState: React.PropTypes.oneOf(['fetching', 'error', 'initial', 'fetched']),
    /**
     * 详情数据
     */
    detail: React.PropTypes.object.isRequired
};

Detail.contextTypes = {
    router: React.PropTypes.object.isRequired
};