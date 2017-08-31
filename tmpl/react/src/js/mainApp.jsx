import React from "react";
import ReactDom from "react-dom";
import TodoModel from "./todoModel";
import TodoApp from "./todoApp";

import "todomvc-common/base.css";
import "todomvc-app-css/index.css";

(function () {
	'use strict';

	var model = new TodoModel('react-todos');

	function render() {
		ReactDom.render(
			<TodoApp model={model}/>,
			document.getElementsByClassName('todoapp')[0]
		);
	}

	model.subscribe(render);
	render();
})();
