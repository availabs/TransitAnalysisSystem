'use strict'


const MongoHostConfigDefaults = require('../MongoHostConfigDefaults')


const { readOnlyUser: readOnlyUserPwd } = require('../../../secrets').mongo


class MongoReadOnlyUserConfigDefaults extends MongoHostConfigDefaults {
  constructor (options = {}) {
    super(options)
    this.dbName = options.feedName

    this.readOnlyUserName = 'transit-ro'
    this.readOnlyUserPwd = readOnlyUserPwd
  }
}


module.exports = MongoReadOnlyUserConfigDefaults
