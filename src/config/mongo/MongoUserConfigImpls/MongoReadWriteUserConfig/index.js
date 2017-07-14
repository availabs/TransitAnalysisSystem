'use strict'


const MongoReadWriteUserConfigDefaults = require('./MongoReadWriteUserConfigDefaults')

const { validateEntityNames, buildMongoConnectionString } = require('../../utils')

const feedConfigs = require('../../../gtfs/feeds/')

const otherUserParamsRegExp = /(?:admin)\|(?:readonly)/i


class MongoReadWriteUserConfig extends MongoReadWriteUserConfigDefaults {
  constructor (options = {}) {
    super(options)

    const mongoConfig = feedConfigs[options.feedName].mongo

    const rwUserConfig = mongoConfig &&
      Object.keys(mongoConfig)
        .filter(k => !k.match(otherUserParamsRegExp))
        .reduce((acc, k) => {
          acc[k] = mongoConfig[k]
          return acc
        }, {})

    Object.assign(this, rwUserConfig, options)

    Object.keys(this).forEach((k) =>
      this[k.replace(/readWriteUser/, 'user')] = this[k]
    )

    this.mongoURL = this.mongoURL ||
        buildMongoConnectionString({
          host: this.host,
          port: this.port,
          username: this.readWriteUserName,
          password: this.readWriteUserPwd,
          adminDbName: this.adminDbName,
          dbName: this.dbName,
        })

    validateEntityNames(this)
  }
}


module.exports = MongoReadWriteUserConfig


