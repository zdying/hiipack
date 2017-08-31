/**
 * @file
 * @author zdying
 */

import React, {Component} from 'react';

import './header.css';

export default class Header extends Component{
    constructor(props){
        super(props);
    }

    render(){
        let leftButton = this.props.leftButton || null;
        let rightButton = this.props.rightButton || null;
        return (
            <header className="m-header">
                {leftButton}
                <span className="title">{this.props.title}</span>
                {rightButton}
            </header>
        )
    }
}

Header.propTypes = {
    /**
     * 标题
     */
    title: React.PropTypes.string.isRequired,
    /**
     * 左侧的按钮
     */
    leftButton: React.PropTypes.element,
    /**
     * 右侧的按钮
     */
    rightButton: React.PropTypes.element
};
