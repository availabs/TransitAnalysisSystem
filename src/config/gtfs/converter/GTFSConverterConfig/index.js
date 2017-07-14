'use strict'


const GTFSConverterConfigDefaults = require('./GTFSConverterConfigDefaults')

const LoggingConfig = require('../../../logging/LoggingConfig')

const feedConfigs = require('../../feeds')


class GTFSConverterConfig extends GTFSConverterConfigDefaults {
  constructor (options = {}) {
    super(options)

    const { converter: feedConfig } = feedConfigs[options.feedName]

    const loggingConfig = new LoggingConfig(options)

    // gtfsConfig & gtfsrtConfig have their own sub objects.
    //   These must be specified in the options.
    Object.assign(this, loggingConfig, feedConfig, options)
  }
}


module.exports = GTFSConverterConfig
