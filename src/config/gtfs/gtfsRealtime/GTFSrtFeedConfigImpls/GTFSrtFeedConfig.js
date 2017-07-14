'use strict'

const path = require('path')

const GTFSrtFeedConfigDefaults = require('./GTFSrtFeedConfigDefaults')

const feedConfigs = require('../../feeds/')


class GTFSrtFeedConfig extends GTFSrtFeedConfigDefaults {
  constructor (options = {}) {
    super(options)

    const { gtfsrt: feedConfig } = feedConfigs[options.feedName]

    Object.assign(this, feedConfig, options)

    // Need to handle this compound parameter as either
    // element may have been overridden by the use.
    this.protofilePath = options.protofilePath
      || options.protofilePath
      || path.join(this.protofileDirPath, this.protofileName)
  }
}


module.exports = GTFSrtFeedConfig

