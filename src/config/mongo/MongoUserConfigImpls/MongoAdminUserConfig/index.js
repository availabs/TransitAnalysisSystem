'use strict'


const MongoAdminUserConfigDefaults = require('./MongoAdminUserConfigDefaults')

const { validateEntityNames, buildMongoConnectionString } = require('../../utils')

const feedConfigs = require('../../../gtfs/feeds/')

const nonAdminUserParamsRegExp = /(?:readonly)\|(?:readwrite)/i


class MongoAdminUserConfig extends MongoAdminUserConfigDefaults {
  constructor (options = {}) {
    super(options)

    const mongoConfig = feedConfigs[options.feedName].mongo

    const adminConfig = mongoConfig &&
      Object.keys(mongoConfig)
        .filter(k => !k.match(nonAdminUserParamsRegExp))
        .reduce((acc, k) => {
          acc[k] = mongoConfig[k]
          return acc
        }, {})

    Object.assign(this, adminConfig, options)

    Object.keys(this).forEach((k) =>
      this[k.replace(/adminUser/, 'user')] = this[k]
    )

    this.mongoURL = this.mongoURL ||
        buildMongoConnectionString({
          host: this.host,
          port: this.port,
          username: this.userName,
          password: this.userPwd,
          adminDbName: this.adminDbName,
          dbName: this.adminDbName,
        })

    validateEntityNames(this)
  }
}


module.exports = MongoAdminUserConfig

