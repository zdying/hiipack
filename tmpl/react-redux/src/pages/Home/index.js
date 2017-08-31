/**
 * @file
 * @author zdying
 */

import React from 'react';
import {connect} from 'react-redux';

import * as Actions from './action';

import NewsList from '../../components/NewsList';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

import MdRoom from 'react-icons/lib/md/room';
import MdRefresh from 'react-icons/lib/md/refresh';

import './home.css';

export class Home extends React.Component{
    constructor(props){
        super(props);

        this.refresh = this.refresh.bind(this);
        this.onStar = this.onStar.bind(this);
        this.onUnStar = this.onUnStar.bind(this);
        this.showDetail = this.showDetail.bind(this);
    }

    componentWillMount(){
        this.refresh();
    }

    render(){
        return (
            <div className="m-list-page">
                <Header
                    title={this.props.route.title}
                    leftButton={<MdRoom className="icon"/>}
                    rightButton={<MdRefresh className="icon" onClick={this.refresh}/>}
                />
                <NewsList
                    list={this.props.list}
                    fetchState={this.props.fetchState}
                    onStar={this.onStar}
                    onUnStar={this.onUnStar}
                    onItemClick={this.showDetail}
                />
                <Footer />
            </div>
        )
    }

    refresh(){
        Actions.fetchList(this.props.dispatch)
    }

    onStar(index){
        this.props.dispatch(Actions.doStar(index))
    }

    onUnStar(index){
        this.props.dispatch(Actions.doUnStar(index))
    }

    showDetail(id){
        console.log('[log] navigate to `/detail/' + id + '`');
        // this.props.history.push('/detail/' + id)
        this.context.router.push('/detail/' + id);
    }
}

function mapStateToProps(state) {
    return state.list;
    // let {
    //     list, fetchState, msg
    // } = state.list;
    //
    // return {
    //     list,
    //     fetchState,
    //     msg
    // }
}

export default connect(mapStateToProps)(Home)

Home.propTypes = {
    /**
     * 页面标题
     */
    // title: React.PropTypes.string.isRequired,
    /**
     * 数据加载状态
     */
    // fetchState: React.PropTypes.oneOf(['fetching', 'error', 'initial', 'fetched']),
    /**
     * 列表数据
     */
    // list: React.PropTypes.array.isRequired
};

Home.contextTypes = {
    router: React.PropTypes.object.isRequired
};
