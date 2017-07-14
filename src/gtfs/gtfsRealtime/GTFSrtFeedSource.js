'use strict'

const Enum = require('enumify').Enum


class GTFSrtFeedSource extends Enum {}

GTFSrtFeedSource.initEnum([
  'LIVE',
  'FILE',
  'MONGO',
])


module.exports = GTFSrtFeedSource
