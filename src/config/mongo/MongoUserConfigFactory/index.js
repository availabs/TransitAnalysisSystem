'use strict'


const MongoUserLevel = require('../MongoUserLevel')

const MongoAdminUserConfig = require('../MongoUserConfigImpls/MongoAdminUserConfig')
const MongoReadWriteUserConfig = require('../MongoUserConfigImpls/MongoReadWriteUserConfig')
const MongoReadOnlyUserConfig = require('../MongoUserConfigImpls/MongoReadOnlyUserConfig')


class MongoUserConfigFactory {
  static build (options = {}) {
    if (!options.userLevel) {
      throw new Error('The userLevel "option" is required.')
    }

    options.userLevel = (options.userLevel instanceof MongoUserLevel)
      ? options.userLevel
      : MongoUserLevel[options.userLevel.toUpperCase()]

    switch (options.userLevel) {

    case MongoUserLevel.ADMIN:
      return new MongoAdminUserConfig(options)

    case MongoUserLevel.READ_WRITE:
      return new MongoReadWriteUserConfig(options)

    case MongoUserLevel.READ_ONLY:
      return new MongoReadOnlyUserConfig(options)

    default:
      throw new Error('Unrecognized MongoDB user level')
    }
  }
}

module.exports = MongoUserConfigFactory
