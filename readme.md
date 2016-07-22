# yo-yo.js

A tiny library for building modular UI components using [DOM diffing](#morphdom) and [ES6 tagged template literals](#tagged-template-literals), powered by [bel](https://www.npmjs.com/package/bel) and [morphdom](https://www.npmjs.com/package/morphdom) and based on the "yo-yo" data binding pattern: data down, actions up. 

yo-yo powers the [choo framework](https://github.com/yoshuawuyts/choo), you should check it out if you want something higher level! or if you want lower level, see the module that powers yo-yo: [bel](https://www.npmjs.com/package/bel)

![logo](yoyojs.png)

Getting started is as easy as <pre>var element = yo\`&lt;h1&gt;hello world!&lt;/h1&gt;\`</pre>

[Give yo-yo a spin in your browser on RequireBin](http://requirebin.com/?gist=8371be058c7c0c087ebe).

## Features

- React-style modular UI components that can efficiently update themselves
- Build your own framework: [small modules that you can swap out](#modules-that-work-well-with-yo-yo) to pick your own tradeoffs
- Uses features available in browsers today instead of inventing new syntax/APIs
- Designed for [template literals](#tagged-template-literals), a templating feature built in to JS
- Uses a [default DOM diffing](#morphdom) strategy based on the real DOM, not a virtual DOM
- Compatible with vanilla DOM elements and vanilla JS data structures
- Doesn't require hundreds of megabytes of devDependencies to build
- 4kb minified + gzipped (6 times smaller than React), small enough for UI components to include as a dependency

## About

`yo-yo` is a modular UI framework, meaning there isn't much code in this repository, much of the functionality comes from other modules (see [`index.js`](index.js)). The goals of `yo-yo` are to choose a good set of default dependencies, document how to use them all together in one place, and use small enough dependencies that you can include a copy of `yo-yo` in standalone UI component modules and publish them to npm.

You can start by simply doing `require('yo-yo')` but as your app grows will most likely want to choose different tradeoffs ([add or remove dependencies](#modules-that-work-well-with-yo-yo)), and `yo-yo` is designed to let you do that without rewriting all of your code due to API changes, forcing you to use certain dependencies, or making you adopt new coding conventions.

In this way `yo-yo` is similar to the modular frameworks [mississippi](https://www.npmjs.com/package/mississippi), [http-framework](https://www.npmjs.com/package/http-framework) and [mercury](https://www.npmjs.com/package/mercury).

## Installing

You can get it [from npm](http://npmjs.org/yo-yo): `npm install yo-yo`

To create a standalone copy run `browserify --standalone yo index.js > yo-yo.js`

## API

The `yo-yo` API is very simple and only has two functions.

### var yo = require('yo-yo')

Returns the `yo` function. There is also a method on `yo` called `yo.update`.

### yo\`template\`

`yo` is a function designed to be used with [tagged template literals](#tagged-template-literals). If your template produces a string containing an HTML element, the `yo` function will take it and produce a new DOM element that you can insert into the DOM.

### yo.update(targetElement, newElement, [opts])

Efficiently updates the attributes and content of an element by [diffing and morphing](#morphdom) a new element onto an existing target element. The two elements + their children should have the same 'shape', as the diff between `newElement` will replace nodes in `targetElement`. `targetElement` will get efficiently updated with only the new DOM nodes from `newElement`, and `newElement` can be discarded afterwards.

Note that many properties of a DOM element **are ignored** when elements are updated. [morphdom](#morphdom) only copies the following properties:

- `node.firstChild`
- `node.tagName`
- `node.nextSibling`
- `node.attributes`
- `node.nodeType`
- `node.nodeValue`

In addition to these `yo-yo` will copy event attributes (e.g. `onclick`, `onmousedown`) that you set using DOM attributes in your template.

`opts` is optional and has these options:

- `events` - set `false` to disable copying of event attributes. otherwise set to an array of strings, one for each event name you want to whitelist for copying. defaults to our default events

The `opts` object will also get passed to `morphdom`.

## Examples

Here are some UI modules implemented using `yo-yo`:

- https://github.com/shama/csv-viewer
- https://github.com/shama/fs-explorer

And here are some simpler examples:

### Creating a simple list

```js
var yo = require('yo-yo')

var el = list([
  'grizzly',
  'polar',
  'brown'
])

function list (items) {
  return yo`<ul>
    ${items.map(function (item) {
      return yo`<li>${item}</li>`
    })}
  </ul>`
}

document.body.appendChild(el)
````

### Dynamic updates

```js
var yo = require('yo-yo')

var numbers = [] // start empty
var el = list(numbers, update)

function list (items, onclick) {
  return yo`<div>
    Random Numbers
    <ul>
      ${items.map(function (item) {
        return yo`<li>${item}</li>`
      })}
    </ul>
    <button onclick=${onclick}>Add Random Number</button>
  </div>`
}

function update () {
  // add a new random number to our list
  numbers.push(Math.random())
  
  // construct a new list and efficiently diff+morph it into the one in the DOM
  var newList = list(numbers, update)
  yo.update(el, newList)
}

document.body.appendChild(el)
```

Clicking the button three times results in this HTML:

```
<div>Random Numbers
  <ul>
    <li>0.027827488956972957</li>
    <li>0.742044786689803</li>
    <li>0.4440679911058396</li>
  </ul>
  <button>Add Random Number</button>
</div>
```

When the button is clicked, thanks to `yo.update`, only a single new `<li>` is inserted into the DOM.
  
### Updating events

Event handlers starting with `on` that you set via attributes will get updated.

```js
function a () { console.log('a') }
function b () { console.log('b') }

var el = yo`<button onclick=${a}>hi</button>`
el.click() // logs 'a' to console

var newEl = yo`<button onclick=${b}>hi</button>`
yo.update(el, newEl)
el.click() // logs 'b' to console
```

This works because [we explicitly copy common event attributes](update-events.js). When `yo.update` is called above, `el` is still the same JavaScript Object instance before and after. The only difference is that `yo.update` will copy any new attributes from `newEl` onto `el`. However, if you add custom properties or events to `newEl` before calling `yo.update`, for example `newEl.addEventListener('foo', handleFoo)`, they will not be copied onto `el`.

## Modules that work well with yo-yo

The functionality built in to `yo-yo` covers the same problems as React and JSX, (DOM diffing and templating), using these dependencies of `yo-yo`:

- [bel](https://npmjs.org/bel) - creates DOM elements from template strings
- [morphdom](https://npmjs.org/morphdom) - efficiently morphs DOM elements (without a virtual DOM)

However you might consider these alternatives to the above built-in choices based on your use case:

- [hyperscript](https://npmjs.com/hyperscript) - alternative to template literals
- [diffhtml](https://npmjs.com/diffhtml) - alternative to morphdom

There are also UI problems that `yo-yo` does not currently address, such as events. But it's easy to use other modules alongside `yo-yo` to create your own framework. We might even add some of these to `yo-yo` in the future:

### Older Browser Compatibility / Production Performance

If you are targeting browsers that may not support template literals and would
like to get a performance boost by transforming your `yo-yo` elements into raw
document calls:

 - [yo-yoify](https://github.com/shama/yo-yoify)

### CSS

- [dom-css](https://npmjs.org/dom-css) - inline CSS helper
- [csjs](https://npmjs.org/csjs) - namespaced CSS helper
- [csjs-extractify](https://github.com/rtsao/csjs-extractify) - csjs browserify transform to compile css bundles
- [csjs-injectify](https://github.com/rtsao/csjs-injectify) - csjs browserify transform that uses [insert-css](https://npmjs.org/insert-css)
- [sheetify](https://github.com/stackcss/sheetify) - browserify modular css transform
- plain css files - you don't always have to use a fancy CSS module :)

### State management

In `yo-yo` state management is left completely up to you. The simplest approach is the "yo-yo" pattern: simply call a callback up until it reaches a parent where you want to handle updates, then `yo.update()` the changes down from there, which keeps the elements isolated. But since you are just working with DOM elements, you can do `yo.update(document.querySelector('.some-other-element'), newelement)` as well.

There are also some other approaches that introduce their own patterns for managing state:

- [store-emitter](https://github.com/sethvincent/store-emitter) - redux-inspired state management library
- [minidux](https://github.com/freeman-lab/minidux) - mini version of redux
- [good-old-fashioned-redux-example](https://github.com/freeman-lab/good-old-fashioned-redux-example) - a redux example implemented in un-fancy JS

## Overview of default dependencies

### bel

[`bel`](https://npmjs.org/bel) is a module that takes the output from a [tagged template string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) and creates or updates (using DOM diffing) a DOM element tree.

### Tagged template literals

[Tagged template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) are a way to use template literals (AKA template strings) with functions that take the output of the template string and format them in a certain way.

Regular template literals lets you take code like this:

```js
var multiline = 'hello\n' +
'this\n' +
'is\n' +
'multiline'
```

And write the same thing like this instead:

```js
var multiline = `hello
this
is
multiline`
```

**Tagged** template literals is where you put a function name in front of the template tags, similar to calling a function with `()` but using the backticks ```` instead of parens.

```js
function doesNothing () {}

doesNothing`im a string`
```

The above example causes the `doesNothing` function to get invoked (AKA called), similar to if you did `doesNothing('im a string')`.

The difference is that tagged template strings return a specific output value.

```js
function logArguments (a, b, c, d) {
  console.log(a, b, c, d)
}

logArguments`im a string`
```

Running the above produces `["im a string", raw: "im a string"] undefined undefined undefined`.

If you were to just run `console.log(`im a string`)` it would produce `"im a string"`.

However, tagged template strings return the above tagged template array output format.

The first item in the array is an array of all of the strings in your template string. In our case there is only one:

```js
["im a string", raw: "im a string"]
```

The `raw` is a property that also contains an array, but where the values are the 'raw' values as there were entered.

If you had this template for example:

```js
logArguments`\u9999`
```

It would produce this as the first argument to logArguments: `["香", raw: ["\u9999"]]`

In template literals, tagged or not, you can interpolate values by embedding javascript expressions inside of `${}`

```js
var name = 'bob'
console.log(`hello ${name}!`)
```

The above produces "hello bob!". However, when called like this:

```js
function logArguments (a, b, c, d) {
  console.log(a, b, c, d)
}

var name = 'bob'
logArguments`hello ${name}!`
```

It produces the tagged template array `["hello ", "!", raw: ["hello ", "!"]] "bob" undefined undefined`

As you can see the first argument is an array of all of the strings, and the rest of the arguments are all of the interpolated values one at a time.

Using this array you can implement your own custom way to render the strings and values. For example to simply print a string you print the strings and values in 'zipped' order):

```js
function printString(strings, valueA, valueB, valueC) {
  console.log(strings[0] + valueA + strings[1] + valueB + strings[2] + valueC)
}
```

You could also imagine writing the above function in a more general way using loops etc. Or do something entirely different:

### hyperx

`yo-yo` uses a module called `bel` which in turn uses `hyperx` to turn tagged template arrays into DOM builder data.

For example:

```js
var hyperx = require('hyperx')

var convertTaggedTemplateOutputToDomBuilder = hyperx(function (tagName, attrs, children) {
  console.log(tagName, attrs, children)
})

convertTaggedTemplateOutputToDomBuilder`<h1>hello world</h1>`
```

Running this produces `h1 {} [ 'hello world' ]`, which aren't yet DOM elements but have all the data you need to build your own DOM elements however you like. These three arguments, `tagName, attrs, children` are a sort of pseudo-standard used by various DOM building libraries such as [virtual-dom](https://www.npmjs.com/package/virtual-dom), [hyperscript](https://www.npmjs.com/package/hyperscript) and [react](https://facebook.github.io/react/docs/glossary.html#react-elements), and now `hyperx` and `bel`.

You can also use DOM elements not created using `hyperx` and `bel`:

```js
var yo = require('yo-yo')
var vanillaElement = document.createElement('h3')
vanillaElement.textContent = 'Hello'

var app = yo`<div class="app">${vanillaElement} World</div>`
```

Running the above sets `app` to an element with this HTML:

```
<div class="app"><h3>Hello</h3> World</div>
```

### morphdom

`yo-yo` lets you do two basic things: create an element and update it. When you create an element it simply creates a new DOM element tree using hyperx and its own custom code that uses `document.createElement`.

However, when you update an element using `yo.update()` it actually uses a module called [`morphdom`](https://npmjs.org/morphdom) to transform the existing DOM tree to match the new DOM tree while minimizing the number of changes to the existing DOM tree. This is a really similar approach to what `react` and `virtual-dom` do, except `morphdom` does not use a virtual DOM, it simply uses the actual DOM.

## Benchmarks

You can find benchmarks at https://github.com/shama/yo-yo-perf
