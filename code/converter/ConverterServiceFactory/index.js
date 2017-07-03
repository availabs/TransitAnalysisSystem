/*
 * The core of the Analysis code.
 * The MTA_Subway_GTFS-Realtime_to_SIRI_Converter's ConverterStream is passed
 *  mocks of the GTFS-RealtimeFeed and the SiriServer's ConfigService.
 * Additionally, this Stream requests new data from the MongoDB archive
 *  once all listeners have completed execution, allowing the archive
 *  to stream through the converter at the fastest possible rate.
 */

'use strict'


/**********************************************************
 * MOCK Converter Service
 *********************************************************/



const path = require('path')

require(path.join(__dirname, '../eventHandling/MockEventHandlingService'))

const MockGTFSFeedHandlerFactory = require('../gtfsFeedHandler/MockGTFSFeedHandlerFactory')
const MockGTFSrtFeedFactory = require('../gtfsrtFeed/MockGTFSrtFeedFactory')
const MockConverterService = require('./MockConverterService')

const mockConfigService = require(path.join(__dirname, '../configsService/MockConfigsService'))

const converterConfig  = mockConfigService.getConverterConfig()

// TODO: Make sure a reference to the trainTrackerInitialState is not kept in the configs service

class MockConverterServiceFactory {

  constructor () {
    throw new Error('Use the static build function.')
  }

  static async build (config) {
    const [
      gtfsFeedHandler,
      gtfsrtFeed
    ] = await Promise.all([
      MockGTFSFeedHandlerFactory.build(),
      MockGTFSrtFeedFactory.build(config.gtfsrt)
    ])

    await gtfsrtFeed.open()

    const trainTrackerInitialState = await gtfsrtFeed.getTrainTrackerInitialState()

    const mockConverterService = new MockConverterService(
        gtfsFeedHandler,
        gtfsrtFeed,
        trainTrackerInitialState,
        converterConfig
    )

    mockConfigService.addConverterConfigUpdateListener(function (_config) {
      mockConverterService.converterStream.updateConfig(_config)
    })

    console.log(Object.keys(mockConverterService))
    return mockConverterService
  }
}


module.exports = MockConverterServiceFactory

