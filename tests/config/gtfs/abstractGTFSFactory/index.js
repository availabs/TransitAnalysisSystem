/* eslint no-unused-expressions: 0 */

'use strict'


const path = require('path')

const expect  = require('chai').expect

const srcDir = path.join(__dirname, '../../../../src/')

const GTFSConfigFactory = require(path.join(srcDir, 'config/gtfs/GTFSConfig/GTFSConfigFactory'))
const GTFSConfig = require(path.join(srcDir, 'config/gtfs/GTFSConfig/GTFSConfig'))

const GTFSFeedConfigFactory =
    require(path.join(srcDir,'config/gtfs/gtfsStatic/GTFSFeedConfigFactory'))

const GTFSrtFeedConfigFactory =
    require(path.join(srcDir,'config/gtfs/gtfsRealtime/GTFSrtFeedConfigFactory'))

const GTFSConverterConfig =
    require(path.join(srcDir, 'config/gtfs/converter/GTFSConverterConfig'))


const feedName = '_test_'


describe('Complete GTFS System config creation', function () {

  const options = {
    feedName,
    gtfs: {
      source: 'FILE',
    },
    gtfsrt: {
      source: 'MONGO',
      userLevel: 'READ_WRITE',
    }
  }

  it('should return an GTFSConfig instance', function () {

    const gtfsConfig = GTFSConfigFactory.build(options)

    expect(gtfsConfig).to.be.an.instanceof(GTFSConfig)
  })

  it('should contain correct sub-configs', function () {

    const gtfsFeedConfig =
      GTFSFeedConfigFactory.build({ feedName, source: 'FILE' })

    const gtfsrtFeedConfig =
      GTFSrtFeedConfigFactory.build({ feedName, source: 'MONGO', userLevel: 'READ_WRITE' })

    const gtfsConverterConfig =
      new GTFSConverterConfig({
        feedName,
        gtfsConfig: gtfsFeedConfig,
        gtfsrtConfig: gtfsrtFeedConfig,
      })

    const gtfsConfig = GTFSConfigFactory.build(options)

    expect(gtfsConfig).to.deep.equal({
      gtfsFeedConfig,
      gtfsrtFeedConfig,
      gtfsConverterConfig,
    })
  })
})

