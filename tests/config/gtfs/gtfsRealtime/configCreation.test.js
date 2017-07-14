/* eslint no-unused-expressions: 0 */

'use strict'


const expect  = require('chai').expect

const MongoUserLevel = require('../../../../src/config/mongo/MongoUserLevel')

const GTFSrtFeedConfigFactory =
  require('../../../../src/config/gtfs/gtfsRealtime/GTFSrtFeedConfigFactory/')

const GTFSrtFeedSource = require('../../../../src/gtfs/gtfsRealtime/GTFSrtFeedSource')

const feedName = 'mta_subway'


describe('GTFSrt FILE Feed Handler config creation', function () {
  it('should return something without crashing using enum', function () {
    const gtfsrtConfig = GTFSrtFeedConfigFactory.build({ feedName, source: GTFSrtFeedSource.FILE })
    expect(gtfsrtConfig).to.exist
  })
})

describe('GTFSrt LIVE Feed Handler config creation', function () {
  it('should return something without crashing using enum', function () {
    const gtfsrtConfig = GTFSrtFeedConfigFactory.build({ feedName, source: GTFSrtFeedSource.LIVE })
    expect(gtfsrtConfig).to.exist
  })
})

describe('GTFSrt MONGO Feed Handler config creation', function () {
  it('should return something without crashing using enum', function () {
    const gtfsrtConfig =
      GTFSrtFeedConfigFactory.build({
        feedName,
        source: GTFSrtFeedSource.MONGO,
        userLevel: MongoUserLevel.READ_ONLY,
      })

    expect(gtfsrtConfig).to.exist
  })
})
