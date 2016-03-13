var hyperx = require('hyperx')
var bel = require('bel')
var morphdom = require('morphdom')

// turns template tag into DOM elements
module.exports = hyperx(function yo (tag, props, children) {
  var el = bel(tag, props, children)

  // store event handlers for diff step
  el._handlers = {}
  for (var name in props) {
    if (props.hasOwnProperty(name) && name.slice(0, 2) === 'on') {
      el._handlers[name] = props[name]
    }
  }

  return el
})

function onBeforeMorphEl (fromEl, toEl) {
  // update element with new event handlers
  for (var name in toEl._handlers) {
    if (toEl._handlers.hasOwnProperty(name)) {
      fromEl[name] = toEl._handlers[name]
    }
  }

  // clean up removed event handlers
  if (fromEl._handlers) {
    for (var name in fromEl._handlers) {
      if (!toEl._handlers.hasOwnProperty(name)) {
        delete fromEl[name]
      }
    }
  }
}

// efficiently diffs + morphs two DOM elements
module.exports.update = function (fromEl, toEl) {
  morphdom(fromEl, toEl, { onBeforeMorphEl: onBeforeMorphEl })
}
