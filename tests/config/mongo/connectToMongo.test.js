/* eslint no-unused-expressions: 0 */

'use strict'

const MongoClient = require('mongodb').MongoClient

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const { expect } = chai

const MongoUserConfigFactory = require('../../../src/config/mongo/MongoUserConfigFactory')
const MongoUserLevel = require('../../../src/config/mongo/MongoUserLevel')

const feedName = 'mta_subway'


describe('Admin user connection', function () {
  it('should connect', function (done) {
    const adminConfig = MongoUserConfigFactory.build({ feedName, userLevel: MongoUserLevel.ADMIN })

    const {
      mongoURL,
      gtfsrtCollectionName
    } = adminConfig

    let db
    expect(
      MongoClient.connect(mongoURL)
        .then(
          (_db) => (db = _db)
        )
        .then(
          () => db.collection(gtfsrtCollectionName).findOne({})
        )
        .then(
          () => db.close()
        )
    ).to.eventually.be.fulfilled.and.notify(done)
  })
})

describe('Read/Write user connection', function () {
  it('should connect', function (done) {
    const rwUserConfig =
      MongoUserConfigFactory.build({
        feedName,
        userLevel: MongoUserLevel.READ_WRITE
      })

    const {
      mongoURL,
      gtfsrtCollectionName
    } = rwUserConfig

    let db
    expect(
      MongoClient.connect(mongoURL)
        .then(
          (_db) => (db = _db)
        )
        .then(
          () => db.collection(gtfsrtCollectionName).findOne({})
        )
        .then(
          () => db.close()
        )
    ).to.eventually.be.fulfilled.and.notify(done)
  })
})

describe('ReadOnly user connection', function () {
  it('should connect', function (done) {
    const rwUserConfig =
      MongoUserConfigFactory.build({
        feedName,
        userLevel: MongoUserLevel.READ_ONLY
      })

    const {
      mongoURL,
      gtfsrtCollectionName
    } = rwUserConfig

    let db
    expect(
      MongoClient.connect(mongoURL)
        .then(
          (_db) => (db = _db)
        )
        .then(
          () => db.collection(gtfsrtCollectionName).findOne({})
        )
        .then(
          () => db.close()
        )
    ).to.eventually.be.fulfilled.and.notify(done)
  })
})
