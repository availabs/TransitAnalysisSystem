'use strict'


const MongoReadOnlyUserConfigDefaults = require('./MongoReadOnlyUserConfigDefaults')

const { validateEntityNames, buildMongoConnectionString } = require('../../utils')

const feedConfigs = require('../../../gtfs/feeds/')

const nonReadOnlyUserParamsRegExp = /(?:admin)\|(?:readwrite)/i


class MongoReadOnlyUserConfig extends MongoReadOnlyUserConfigDefaults {
  constructor (options = {}) {
    super(options)

    const mongoConfig = feedConfigs[options.feedName].mongo

    const roUserConfig = mongoConfig &&
      Object.keys(mongoConfig)
        .filter(k => !k.match(nonReadOnlyUserParamsRegExp))
        .reduce((acc, k) => {
          acc[k] = mongoConfig[k]
          return acc
        }, {})

    Object.assign(this, roUserConfig, options)

    Object.keys(this).forEach((k) =>
      this[k.replace(/readOnlyUser/, 'user')] = this[k]
    )

    this.mongoURL = this.mongoURL ||
        buildMongoConnectionString({
          host: this.host,
          port: this.port,
          username: this.readOnlyUserName,
          password: this.readOnlyUserPwd,
          adminDbName: this.adminDbName,
          dbName: this.dbName,
        })

    validateEntityNames(this)
  }
}


module.exports = MongoReadOnlyUserConfig


