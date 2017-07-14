'use strict'


const GTFSrtFeedSource = require('../GTFSrtFeedSource')

const FileSystemArchiveGTFSrtFeedHandler = require('../GTFSrtFeedHandlerImpls/FileSystemArchiveGTFSrtFeedHandler')
const LiveGTFSrtFeedHandler = require('../GTFSrtFeedHandlerImpls/LiveGTFSrtFeedHandler')
const MongoGTFSrtFeedHandler = require('../GTFSrtFeedHandlerImpls/MongoGTFSrtFeedHandler')


class GTFSrtFeedHandlerFactory {
  constructor () {
    throw new Error('The build method is static.')
  }

  static async build (gtfsrtConfig) {
    switch (gtfsrtConfig.source) {

    case GTFSrtFeedSource.FILE:
      return new FileSystemArchiveGTFSrtFeedHandler(gtfsrtConfig)
    case GTFSrtFeedSource.LIVE:
      return new LiveGTFSrtFeedHandler(gtfsrtConfig)
    case GTFSrtFeedSource.MONGO:
      return new MongoGTFSrtFeedHandler(gtfsrtConfig)
    default:
      throw new Error('Unrecognized source')
    }
  }
}

module.exports = GTFSrtFeedHandlerFactory

