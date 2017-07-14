'use strict'


const MongoHostConfigDefaults = require('../MongoHostConfigDefaults')

const { adminUser: adminUserPwd } = require('../../../secrets').mongo


class MongoAdminUserConfigDefaults extends MongoHostConfigDefaults {
  constructor () {
    super()
    this.adminUserName = 'avail'
    this.adminUserPwd = adminUserPwd
  }
}


module.exports = MongoAdminUserConfigDefaults
