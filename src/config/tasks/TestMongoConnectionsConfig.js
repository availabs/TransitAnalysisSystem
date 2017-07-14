'use strict'

const MongoAdminConfig = require('../mongo/MongoAdminConfig')
const MongoReadWriteConfig = require('../mongo/MongoReadWriteConfig')
const MongoReadOnlyConfig = require('../mongo/MongoReadOnlyConfig')

class TestMongoConnectionsConfig {
  constructor (feedName) {
    this.adminUserConfig = new MongoAdminConfig(feedName)
    this.readWriteUserConfig = new MongoReadWriteConfig(feedName)
    this.readOnlyUserConfig = new MongoReadOnlyConfig(feedName)
  }
}

module.exports = TestMongoConnectionsConfig
