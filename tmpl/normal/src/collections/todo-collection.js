// ----------------------------------------------------------------------------
// imports
//
var Backbone = require('backbone')
var TodoModel = require('../models/todo-model')


// ----------------------------------------------------------------------------
// TodoCollection
//
var TodoCollection = Backbone.Collection.extend({
  model: TodoModel,
})


// ----------------------------------------------------------------------------
// exports
//
module.exports = TodoCollection
