'use strict'


const LoggingConfigDefaults = require('./LoggingConfigDefaults')

const feedConfigs = require('../../gtfs/feeds')


class LoggingConfig extends LoggingConfigDefaults {
  constructor (options) {
    super(options)

    const { logging: loggingConfig } = feedConfigs[options.feedName]

    Object.assign(this, loggingConfig)

  }
}


module.exports = LoggingConfig
