'use strict'

const cdta = require('./cdta')
const lirr = require('./lirr')
const mtaLLine = require('./mta_l-line')
const mta_staten_island = require('./mta_staten_island')
const mta_subway = require('./mta_subway')

const _test_ = require('./_test_')


const feedsConfigs = {
  _test_,
  cdta,
  lirr,
  'mta_l-line': mtaLLine,
  mta_staten_island,
  mta_subway,
}


module.exports = feedsConfigs
