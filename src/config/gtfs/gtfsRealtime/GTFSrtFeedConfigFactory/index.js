'use strict'


const GTFSrtFeedSource = require('../../../../gtfs/gtfsRealtime/GTFSrtFeedSource')

const FileSystemArchiveGTFSrtFeedConfig =
    require('../GTFSrtFeedConfigImpls/FileSystemArchiveGTFSrtFeedConfig')
const LiveGTFSrtFeedConfig =
    require('../GTFSrtFeedConfigImpls/LiveGTFSrtFeedConfig')
const MongoGTFSrtFeedConfig =
    require('../GTFSrtFeedConfigImpls/MongoGTFSrtFeedConfig')


class GTFSrtFeedConfigFactory {
  static build (options = {}) {
    options.source = (options.source instanceof GTFSrtFeedSource)
      ? options.source
      : GTFSrtFeedSource[options.source.toUpperCase()]

    switch (options.source) {

    case GTFSrtFeedSource.FILE:
      return new FileSystemArchiveGTFSrtFeedConfig(options)

    case GTFSrtFeedSource.LIVE:
      return new LiveGTFSrtFeedConfig(options)

    case GTFSrtFeedSource.MONGO:
      return new MongoGTFSrtFeedConfig(options)

    default:
      throw new Error('Unrecognized source')
    }
  }
}

module.exports = GTFSrtFeedConfigFactory

