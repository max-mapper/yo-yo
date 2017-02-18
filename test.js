/*global Event*/
var test = require('tape')
var yo = require('./')

test('event attribute gets updated', function (t) {
  t.plan(2)
  function a () { t.ok(true, 'called a') }
  function b () { t.ok(true, 'called b') }
  var el = yo`<button onclick=${a}>hi</button>`
  el.click()
  yo.update(el, yo`<button onclick=${b}>hi</button>`)
  el.click()
})

test('event attribute gets removed', function (t) {
  t.plan(1)
  function a () { t.ok(true, 'called a') }
  var el = yo`<button onclick=${a}>hi</button>`
  el.click()
  yo.update(el, yo`<button>hi</button>`)
  el.click()
})

test('custom event listeners and properties are ignored', function (t) {
  t.plan(3)
  function a () { t.ok(true, 'called a') }
  function b () { t.ok(true, 'called b') }
  function c () { t.notOk(true, 'should not call c') }
  var el = yo`<button onclick=${a}>hi</button>`
  el.click()
  var newEl = yo`<button onclick=${b}>hi</button>`
  newEl.foo = 999
  newEl.addEventListener('foobar', c)
  yo.update(el, newEl)
  t.equal(el.foo, undefined, 'no el.foo')
  el.dispatchEvent(new Event('foobar'))
  el.click()
})

test('input values get copied', function (t) {
  t.plan(1)
  var el = yo`<input type="text" />`
  el.value = 'hi'
  var newEl = yo`<input type="text" />`
  yo.update(el, newEl)
  t.equal(el.value, 'hi')
})

test('input value gets updated', function (t) {
    t.plan(1)
    var el = yo`<input type="text" />`
    el.value = 'howdy'
    var newEl = yo`<input type="text" />`
    newEl.value = 'hi'
    yo.update(el, newEl)
    t.equal(el.value, 'hi')
})

test('input value can be update to empty string', function (t) {
  t.plan(1)
  var el = yo`<input type="text"/>`
  el.value = 'hola'
  var newEl = yo`<input type="text" value=""/>`
  yo.update(el, newEl)
  t.equal(el.value, '')
})

test('textarea values get copied', function (t) {
  t.plan(1)
  function textarea (val) {
    return yo`<textarea>${val}</textarea>`
  }
  var el = textarea('foo')
  yo.update(el, textarea('bar'))
  t.equal(el.value, 'bar')
})
