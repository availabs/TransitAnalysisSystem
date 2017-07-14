'use strict'


const MongoUserConfigFactory = require('../../../mongo/MongoUserConfigFactory')

const GTFSrtFeedConfig = require('./GTFSrtFeedConfig')

class MongoGTFSrtFeedConfig extends GTFSrtFeedConfig {
  constructor (options = {}) {
    super(options)

    const mongoUserConfig = MongoUserConfigFactory.build(options)

    Object.assign(this, mongoUserConfig, options)
  }
}


module.exports = MongoGTFSrtFeedConfig

