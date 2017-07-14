'use strict'


const MongoHostConfigDefaults = require('../MongoHostConfigDefaults')

const { readWriteUser: readWriteUserPwd } = require('../../../secrets').mongo

class MongoReadWriteUserConfigDefaults extends MongoHostConfigDefaults {
  constructor (options = {}) {
    super(options)
    this.dbName = options.feedName

    this.readWriteUserName = 'transit-rw'
    this.readWriteUserPwd = readWriteUserPwd
  }
}


module.exports = MongoReadWriteUserConfigDefaults
