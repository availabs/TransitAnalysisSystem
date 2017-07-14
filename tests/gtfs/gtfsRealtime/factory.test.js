/* eslint no-unused-expressions: 0 */

'use strict'

const path = require('path')

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const { expect } = chai


const baseDir = path.join(__dirname, '../../../src/gtfs/gtfsRealtime/')


const GTFSrtFeedConfigFactory =
  require('../../../src/config/gtfs/gtfsRealtime/GTFSrtFeedConfigFactory')

const GTFSrtFeedHandlerFactory = require(path.join(baseDir, 'GTFSrtFeedHandlerFactory'))
const GTFSrtFeedSource = require(path.join(baseDir, 'GTFSrtFeedSource'))


const FileSystemArchiveGTFSrtFeedHandler =
  require(path.join(baseDir, 'GTFSrtFeedHandlerImpls/FileSystemArchiveGTFSrtFeedHandler.js'))

const LiveGTFSrtFeedHandler =
  require(path.join(baseDir, 'GTFSrtFeedHandlerImpls/LiveGTFSrtFeedHandler.js'))

const MongoGTFSrtFeedHandler =
  require(path.join(baseDir, 'GTFSrtFeedHandlerImpls/MongoGTFSrtFeedHandler.js'))


const feedName = 'mta_subway'


describe('GTFSrtFeedHandlerFactory', function () {
  it('should return a FileSystemArchiveGTFSrtFeedHandler when source=FILE', function (done) {
    const config = GTFSrtFeedConfigFactory.build({ feedName, source: GTFSrtFeedSource.FILE })

    expect(
      GTFSrtFeedHandlerFactory.build(config)
    ).to.eventually.be.an.instanceof(FileSystemArchiveGTFSrtFeedHandler).and.notify(done)
  })

  it('should return a LiveGTFSrtFeedHandler when source=LIVE', function (done) {
    const config = GTFSrtFeedConfigFactory.build({ feedName, source: GTFSrtFeedSource.LIVE })

    expect(
      GTFSrtFeedHandlerFactory.build(config)
    ).to.eventually.be.an.instanceof(LiveGTFSrtFeedHandler).and.notify(done)
  })

  it('should return a MongoGTFSrtFeedHandler when source=MONGO', function (done) {
    const options = {  feedName, source: GTFSrtFeedSource.MONGO, userLevel: 'READ_ONLY' }
    const config = GTFSrtFeedConfigFactory.build(options)

    expect(
      GTFSrtFeedHandlerFactory.build(config)
    ).to.eventually.be.an.instanceof(MongoGTFSrtFeedHandler).and.notify(done)
  })
})
