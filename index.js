var defaultEvents = require('update-events') // Array of DOM update events
var bel = require('bel') // turns template tag into DOM elements
var morphdom = require('morphdom') // efficiently diffs + morphs two DOM elements

module.exports = bel
module.exports.update = function(fromNode, toNode, opts) {
  opts = opts || {}
  opts.onBeforeElUpdated = currier(opts.onBeforeElUpdated, opts.events)
  return morphdom(fromNode, toNode, opts)
}

function currier(update, events) {
  update = update || function() {}
  events = events || defaultEvents
  return function copier(f, t) {
    // copy events:
    events.forEach(
      function(e) {
        if (t[e]) {
          f[e] = t[e]
        }
        else if (f[e]) {
          f[e] = undefined
        }
      }
    )
    // copy values for form elements
    if ((f.nodeName === 'INPUT' && f.type !== 'file') ||
      f.nodeName === 'TEXTAREA' ||
      f.nodeName === 'SELECT') {
      if (t.getAttribute('value') === null) t.value = f.value
    }
    update(f, t)
  }
}
