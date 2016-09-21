var defaultEvents = require('update-events') // default common events to be copied when DOM elements update
var bel = require('bel') // turns template tag into DOM elements
var morphdom = require('morphdom') // efficiently diffs + morphs two DOM elements

module.exports = bel
module.exports.update = function(fromNode, toNode, opts) {
  opts = opts || {}
  // allow users to supply an additional onBeforeElUpdated method by currying it with our own.
  opts.onBeforeElUpdated = currier(opts.onBeforeElUpdated, opts.events)
  return morphdom(fromNode, toNode, opts)
}

function currier(update, events) {
  // allow users to pass in only the events they are using OR
  // loop through a list of common events.
  // *Better performance when you pass in only the events used to copy.*
  events = events || defaultEvents
  // morphdom only copies attributes.
  // we decided we also wanted to copy events that can be set via attributes.
  // return the curried copy events function.
  return function copier(f, t) {
    // copy events:
    events.forEach(
      function(e) {
        if (t[e]) { // if new element has a whitelisted event attribute
          f[e] = t[e] // update existing element
        }
        else if (f[e]) { // if existing element has it and new one doesn't
          f[e] = undefined // remove it from existing element
        }
      }
    )
    // copy values for form elements
    if ((f.nodeName === 'INPUT' && f.type !== 'file') ||
      f.nodeName === 'TEXTAREA' ||
      f.nodeName === 'SELECT') {
      if (t.getAttribute('value') === null) t.value = f.value
    }
    // call the user supplied onBeforeElUpdated method if it exists
    update? update(f, t): null
  }
}
