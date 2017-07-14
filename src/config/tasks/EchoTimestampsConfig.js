'use strict'


const MongoReadOnlyConfig = require('../mongo/MongoReadOnlyConfig')
const ConverterConfig = require('../converter/ConverterConfig')


class EchoTimestampsConfig {
  constructor (feedName) {
    this.mongoReadOnlyUserConfig = new MongoReadOnlyConfig(null)
    this.gtfsConverterConfig = new ConverterConfig(feedName)
  }
}


module.exports = EchoTimestampsConfig

