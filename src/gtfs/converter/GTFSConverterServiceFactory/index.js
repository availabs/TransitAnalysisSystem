'use strict'


const GTFSFeedHandlerFactory = require('../../gtfsStatic/GTFSFeedHandlerFactory')

const GTFSrtFeedHandlerFactory = require('../../gtfsRealtime/GTFSrtFeedHandlerFactory')

const GTFSConverterService = require('../GTFSConverterService')


class GTFSConverterServiceFactory {

  constructor () {
    throw new Error('Use the static build function.')
  }

  static async build ({
    gtfsFeedConfig,
    gtfsFeedHandler,

    gtfsrtFeedHandler,
    gtfsrtFeedConfig,

    gtfsConverterConfig,

    filterConditions,
  }) {

    [ gtfsFeedHandler, gtfsrtFeedHandler ] = await Promise.all([
      (gtfsFeedHandler)
        ? Promise.resolve(gtfsFeedHandler)
        : GTFSFeedHandlerFactory.build(gtfsFeedConfig),
      (gtfsrtFeedHandler)
        ? Promise.resolve(gtfsrtFeedHandler)
        : GTFSrtFeedHandlerFactory.build(gtfsrtFeedConfig),
    ])

    if (filterConditions) {
      gtfsrtFeedHandler.setQueryFilters(filterConditions)
    }

    await gtfsrtFeedHandler.open()

    const trainTrackerInitialState = await gtfsrtFeedHandler.getTrainTrackerInitialState()

    const converterService = new GTFSConverterService({
      gtfsFeedHandler,
      gtfsrtFeedHandler,
      trainTrackerInitialState,
      gtfsConverterConfig
    })

    // When we add historical data, we will need to apply the appropriate GTFS Static Data.
    // mockConfigService.addGTFSConverterConfigUpdateListener(function (_config) {
    //   converterService.converterStream.updateConfig(_config)
    // })

    return converterService
  }
}


module.exports = GTFSConverterServiceFactory

