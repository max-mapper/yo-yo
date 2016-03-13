var yo = require('yo-yo')

var count = 5
var numbers = [] // start empty
var el = list(numbers, function() { update(0) })

function list (items, onclick) {
  return yo`<div>Countdown
    <ul>
      ${items.map(function (item) {
        return yo`<li>${item}</li>`
      })}
    </ul>
    <button onclick=${count > 0 ? onclick : null}>Subtract Random Number</button>
  </div>`
}

function update (n) {
  // subtract n from our count
  count -= n
  numbers.push(count)
  
  // construct a new list and efficiently diff+morph it into the one in the DOM
  var newList = list(numbers, function() { update(Math.random()) })
  yo.update(el, newList)
}

document.body.appendChild(el)
