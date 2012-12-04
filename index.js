var load = require('script-loader')
var domify = require('domify')
var classes = require('classes')
var Emitter = require('emitter')
var debug = require('debug')
var template = require('./template').trim()
var nextTick = require('next-tick')
var persona = undefined
var log = debug('persona')

/**
 * Singleton Factory
 */
module.exports = function() {
  persona = persona || new Persona()
  persona.load()
  return persona
}

function Persona() {

}

Emitter(Persona.prototype)

Persona.prototype.load = function(fn) {
  if (this.loaded) return
  fn = fn || function() {}
  this.loader = load("https://login.persona.org/include.js")
  this.loader.onLoad(function() {
    log('loaded persona')
    this.init()
    this.loaded = true
    this.emit('loaded')
    if (this.doLogin) this.login()
    if (this.doLogout) this.logout()
  }.bind(this))
  return this
}

Persona.prototype.init = function() {
  navigator.id.watch({
    onlogin: function(assertion) {
      log('logged in', arguments)
      this.emit('login', assertion)
    }.bind(this),
    onlogout: function() {
      log('logged out', arguments)
      this.emit('logout')
    }.bind(this)
  });
}

Persona.prototype.button = function(options) {
  var button = new PersonaButton(options)
  nextTick(button.render.bind(button))
  return button
}

Persona.prototype.login = function() {
  if (!navigator.id) return this.doLogin = true // do later
  return navigator.id.request()
}

Persona.prototype.logout = function() {
  if (!navigator.id) return this.doLogout = true // do later
  return navigator.id.request()
}


function PersonaButton(options) {
  if (options instanceof HTMLElement) this.el = options
  options = options || {}
  this.color = options.color || 'black'
  this.style = options.style || 'persona'
  this.el = options.el || this.el || domify(template)[0]

  this.el.addEventListener('click', function(e) {
    e.preventDefault()
    e.stopImmediatePropagation()
    persona.login()
  }.bind(this))
}

PersonaButton.prototype.black = function() {
  this.color = 'black'
  return this
}
PersonaButton.prototype.blue = function() {
  this.color = 'blue'
  return this
}
PersonaButton.prototype.red = function() {
  this.color = 'red'
  return this
}

PersonaButton.prototype.persona = function() {
  this.style = 'persona'
  return this
}

PersonaButton.prototype.email = function() {
  this.style = 'email'
  return this
}

PersonaButton.prototype.plain = function() {
  this.style = 'plain'
  return this
}

PersonaButton.prototype.render = function() {
  classes(this.el)
    .add('persona-button')
    .add('persona-' + this.style)
    .add('persona-' + this.color)
  return this
}
