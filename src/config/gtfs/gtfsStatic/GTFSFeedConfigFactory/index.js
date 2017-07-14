'use strict'


const GTFSFeedSource = require('../../../../gtfs/gtfsStatic/GTFSFeedSource')

const FileSystemGTFSFeedConfig =
    require('../GTFSFeedConfigImpls/FileSystemGTFSFeedConfig')


class GTFSFeedConfigFactory {
  static build (options = {}) {
    options.source = (options.source instanceof GTFSFeedSource)
      ? options.source
      : GTFSFeedSource[options.source.toUpperCase()]

    switch (options.source) {

    case GTFSFeedSource.FILE:
      return new FileSystemGTFSFeedConfig(options)

    default:
      throw new Error('Unrecognized GTFS Feed source')
    }
  }
}

module.exports = GTFSFeedConfigFactory


