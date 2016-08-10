// ----------------------------------------------------------------------------
// imports
//
var Backbone = require('backbone')


// ----------------------------------------------------------------------------
// TodoModel
//
var TodoModel = Backbone.Model.extend({
  defaults: {
    title: '',
    completed: false,
  },

  toggle: function() {
    this.set('completed', !this.get('completed'))
  },
})


// ----------------------------------------------------------------------------
// exports
//
module.exports = TodoModel
