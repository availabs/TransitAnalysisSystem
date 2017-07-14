'use strict'


const _ = require('lodash')

const GTFSFeedConfigFactory = require('../../gtfsStatic/GTFSFeedConfigFactory')
const GTFSrtFeedConfigFactory = require('../../gtfsRealtime/GTFSrtFeedConfigFactory')
const GTFSConverterConfig = require('../../converter/GTFSConverterConfig')

const GTFSConfig = require('../GTFSConfig')


const scopes = ['gtfs', 'gtfsrt', 'converter']


class GTFSConfigFactory {
  static build (options = {}) {

    // Unscoped options are shared between components.
    const gtfsFeedOptions = Object.assign({}, _.omit(options, scopes), options.gtfs)
    const gtfsrtFeedOptions = Object.assign({}, _.omit(options, scopes), options.gtfsrt)
    const converterOptions = Object.assign({}, _.omit(options, scopes), options.converter)

    const gtfsFeedConfig = GTFSFeedConfigFactory.build(gtfsFeedOptions)
    const gtfsrtFeedConfig = GTFSrtFeedConfigFactory.build(gtfsrtFeedOptions)

    converterOptions.gtfsConfig = gtfsFeedConfig
    converterOptions.gtfsrtConfig = gtfsrtFeedConfig

    const gtfsConverterConfig = new GTFSConverterConfig(converterOptions)

    return new GTFSConfig({
      gtfsFeedConfig,
      gtfsrtFeedConfig,
      gtfsConverterConfig,
    })
  }
}

module.exports = GTFSConfigFactory


