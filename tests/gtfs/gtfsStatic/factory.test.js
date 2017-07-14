/* eslint no-unused-expressions: 0 */

'use strict'


const expect  = require('chai').expect

const GTFSFeedConfigFactory = require('../../../src/config/gtfs/gtfsStatic/GTFSFeedConfigFactory')
const GTFSFeedHandlerFactory = require('../../../src/gtfs/gtfsStatic/GTFSFeedHandlerFactory')
const GTFSFeedSource = require('../../../src/gtfs/gtfsStatic/GTFSFeedSource')

const FileSystemGTFSFeedHandler =
    require('../../../src/gtfs/gtfsStatic/GTFSFeedHandlerImpls/FileSystemGTFSFeedHandler')

const feedName = '_test_'


describe('GTFSFeedHandlerFactory', function () {
  it('should return a FileSystemGTFSFeedHandler when source=FILE', function (done) {
    this.timeout(0) // no timeout

    const config = GTFSFeedConfigFactory.build({ feedName, source: GTFSFeedSource.FILE })

    expect(
      GTFSFeedHandlerFactory.build(config)
    ).to.eventually.be.an.instanceof(FileSystemGTFSFeedHandler).and.notify(done)
  })
})
