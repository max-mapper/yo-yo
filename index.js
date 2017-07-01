var bel = require('bel') // turns template tag into DOM elements
var nanomorph = require('nanomorph') // efficiently diffs + morphs two DOM elements

module.exports = bel

module.exports.update = nanomorph
