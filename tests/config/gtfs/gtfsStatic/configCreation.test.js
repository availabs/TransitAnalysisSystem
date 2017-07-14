/* eslint no-unused-expressions: 0 */

'use strict'


const expect  = require('chai').expect

const GTFSFeedConfigFactory = require('../../../../src/config/gtfs/gtfsStatic/GTFSFeedConfigFactory/')
const GTFSFeedSource = require('../../../../src/gtfs/gtfsStatic/GTFSFeedSource')

const feedName = 'mta_subway'


describe('GTFS FILE System Feed Handler config creation', function () {
  it('should return something without crashing using enum', function () {
    const gtfsConfig = GTFSFeedConfigFactory.build({ feedName, source: GTFSFeedSource.FILE })
    expect(gtfsConfig).to.exist
  })
})
