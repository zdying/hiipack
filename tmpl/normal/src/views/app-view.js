// ----------------------------------------------------------------------------
// imports
//
var Backbone = require('backbone')
var $ = require('jquery')
Backbone.$ = $
var TodoView = require('./todo-view')
var constants = require('../utils/constants')


// ----------------------------------------------------------------------------
// AppView
var AppView = Backbone.View.extend({
  events: {
    'keypress #new-todo': 'createOnEnter'
  },

  initialize: function() {
    this.listenTo(this.collection, 'add', this.addOne)
  },

  addOne: function(todo) {
    var view = new TodoView({model: todo})
    this.$('#todo-list').append(view.render().el)
  },

  createOnEnter: function(e) {
    if (e.which === constants.ENTER_KEY) {
      var input = this.$('#new-todo')
      var title = input.val().trim()
      if (title) {
        this.collection.add({title: title})
        input.val('')
      }
    }
  },
})


// ----------------------------------------------------------------------------
// exports
//
module.exports = AppView
