/* eslint no-unused-expressions: 0 */

'use strict'


const expect  = require('chai').expect


const MongoUserConfigFactory = require('../../../src/config/mongo/MongoUserConfigFactory')
const MongoUserLevel = require('../../../src/config/mongo/MongoUserLevel')


const feedName = 'mta_subway'


describe('Admin user config creation', function () {
  it('should return something without crashing using enum', function () {
    const adminConfig = MongoUserConfigFactory.build({ feedName, userLevel: MongoUserLevel.ADMIN })
    expect(adminConfig).to.exist
  })

  it('should return something without crashing using string', function () {
    const adminConfig = MongoUserConfigFactory.build({ feedName, userLevel: 'ADMIN' })
    expect(adminConfig).to.exist
  })
})

describe('Read/Write user config creation', function () {
  it('should return something without crashing using enum', function () {
    const readWrite = MongoUserConfigFactory.build({ feedName, userLevel: MongoUserLevel.READ_WRITE })
    expect(readWrite).to.exist
  })

  it('should return something without crashing using string', function () {
    const readWrite = MongoUserConfigFactory.build({ feedName, userLevel: 'READ_WRITE' })
    expect(readWrite).to.exist
  })
})

describe('ReadOnly user config creation', function () {
  it('should return something without crashing using enum', function () {
    const readOnly = MongoUserConfigFactory.build({ feedName, userLevel: MongoUserLevel.READ_ONLY })
    expect(readOnly).to.exist
  })

  it('should return something without crashing using string', function () {
    const readOnly = MongoUserConfigFactory.build({ feedName, userLevel: 'READ_ONLY' })
    expect(readOnly).to.exist
  })
})
