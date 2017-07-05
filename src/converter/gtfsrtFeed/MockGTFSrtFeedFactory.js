'use strict'

const MongoMockGTFSrtFeed = require('./MockGTFSrtFeed.MongoImpl')
const FileSystemMockGTFSrtFeed = require('./MockGTFSrtFeed.FileSystemImpl')
const LiveMockGTFSrtFeed = require('./MockGTFSrtFeed.LiveImpl')
const { buildQueries } = require('../../utils/SimpleMongoQueryBuilder')


class MockGTFSrtFeedFactory {
  constructor () {
    throw new Error('The build method is static.')
  }

  static async build (config) {
    let feed

    if (config.mongoConfig) {
      feed = new MongoMockGTFSrtFeed(config.mongoConfig)
    } else if (config.fileSystemConfig) {
      feed = new FileSystemMockGTFSrtFeed(config.fileSystemConfig)
    } else if (config.httpServerConfig) {
      feed = new LiveMockGTFSrtFeed(config.httpServerConfig)
    } else {
      throw new Error('Invalid configuration.')
    }

    if (config.filterConditions) {
      const queryFilters = buildQueries(config.filterConditions)

      feed.setQueryFilters(queryFilters)
    }

    return feed
  }
}

module.exports = MockGTFSrtFeedFactory

