/**
 * @file
 * @author zdying
 */

import React, {Component} from 'react';

import './footer.css';

export default class Footer extends Component{
    constructor(props){
        super(props);
    }

    render(){
        return (
            <div className="m-footer">
                <ul className="list">
                    <li className="active">生活</li>
                    <li>军事</li>
                    <li>科技</li>
                    <li>财经</li>
                    <li>美女</li>
                    <li>本地</li>
                </ul>
            </div>
        )
    }
}