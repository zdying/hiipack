var Backbone = require('backbone')
var $ = require('jquery')
// var Handlebars = require('handlebars')

Backbone.$ = $

var TodoView = Backbone.View.extend({
  tagName: 'li',

  // template: Handlebars.compile($('#item-template').html()),
  template: require('./item.mustache'),

  events: {
    'click .toggle': 'toggleCompleted',
  },

  initialize: function() {
    this.listenTo(this.model, 'destroy', this.remove)
  },

  render: function() {
    var viewData = {
      title: this.model.get('title'),
      checked: this.model.get('completed') ? 'checked' : '',
    }
    this.$el.html(this.template(viewData))
    return this
  },

  toggleCompleted: function() {
    this.model.toggle()
  },
})

module.exports = TodoView
