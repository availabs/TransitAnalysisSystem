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

    return mockConverterService
  }
}


module.exports = MockConverterServiceFactory

