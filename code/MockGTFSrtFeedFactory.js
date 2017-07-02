'use strict'

const MongoMockGTFSrtFeed = require('./MockGTFSrtFeed.Mongo')
const FileSystemMockGTFSrtFeed = require('./MockGTFSrtFeed.FileSystem')

class MockGTFSrtFeedFactory {
  constructor () {
    throw new Error('The build method is static.')
  }

  static async build (config) {
    let feed

    if (config.mongoConfig) {
      feed = new MongoMockGTFSrtFeed(config.mongoConfig)
    } else if (config.gtfsrt.fileSystemConfig) {
      feed = new FileSystemMockGTFSrtFeed(config.fileSystemConfig)
    } else {
      throw new Error('Invalid configuration.')
    }


    if (config.queryFilters) {
      feed.setQueryFilters(config.queryFilters)
    }

    return feed
  }
}

module.exports = MockGTFSrtFeedFactory

