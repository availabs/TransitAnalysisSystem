'use strict'


const GTFSrtFeedConfig = require('./GTFSrtFeedConfig')


class LiveGTFSrtFeedConfig extends GTFSrtFeedConfig {
  constructor (options = {}) {
    super(options)
    Object.assign(this, options)
  }
}


module.exports = LiveGTFSrtFeedConfig
