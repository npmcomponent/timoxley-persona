var load = require('script-loader')
var domify = require('domify')
var classes = require('classes')
var Emitter = require('emitter')
var debug = require('debug')
var template = require('./template').trim()

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
  return new PersonaButton(options)
}

Persona.prototype.login = function() {
  if (!navigator.id) this.doLogin = true // do later
  return navigator.id.request()
}

Persona.prototype.logout = function() {
  if (!navigator.id) this.doLogout = true // do later
  return navigator.id.request()
}


function PersonaButton(options) {
  if (typeof options === 'string') this.color = options
  this.color = this.color || 'black'
  if (options instanceof HTMLElement) this.el = options
  options = options || {}
  this.color = options.color || this.color
  this.el = options.el || this.el || this.render()
  classes(this.el).add(this.color)

  this.el.addEventListener('click', function(e) {
    e.preventDefault()
    e.stopImmediatePropagation()
    persona.login()
  }.bind(this))
}

PersonaButton.prototype.render = function() {
  return domify(template)[0]
}
