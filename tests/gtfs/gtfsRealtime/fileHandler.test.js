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


const feedName = 'mta_subway'


describe('FileSystemArchiveGTFSrtFeedHandler', function () {
  it('iterates through files in the data directory', function (done) {
    const config = GTFSrtFeedConfigFactory.build({ feedName, source: GTFSrtFeedSource.FILE })

    expect(
      GTFSrtFeedHandlerFactory.build(config)
    ).to.eventually.be.an.instanceof(FileSystemArchiveGTFSrtFeedHandler).and.notify(done)
  })
})

