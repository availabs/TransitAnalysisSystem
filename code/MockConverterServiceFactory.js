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

require(__dirname + '/MockEventHandlingService')


const path = require('path')

const ConverterStream  = require('MTA_Subway_GTFS-Realtime_to_SIRI_Converter').ConverterStream

const MockGTFSFeedHandlerFactory = require('./MockGTFSFeedHandlerFactory')
const MockGTFSrtFeedFactory = require('./MockGTFSrtFeedFactory')

const siriRequestParams = {
  vehiclemonitoringdetaillevel: 'calls'
}

const mockConfigService = require(path.join(__dirname, 'MockConfigsService'))

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

    console.log(Object.keys(gtfsFeedHandler))
    console.log(Object.keys(gtfsrtFeed))

    await gtfsrtFeed.open()

    const trainTrackerInitialState = await gtfsrtFeed.getTrainTrackerInitialState()

    const mockConverterService = new MockConverterService(
        gtfsFeedHandler,
        gtfsrtFeed,
        trainTrackerInitialState
    )

    mockConfigService.addConverterConfigUpdateListener(function (_config) {
      mockConverterService.converterStream.updateConfig(_config)
    })

    console.log(Object.keys(mockConverterService))
    return mockConverterService
  }
}


class MockConverterService {

  constructor (gtfsFeedHandler, gtfsrtFeed, trainTrackerInitialState) {

    this.gtfsFeedHandler = gtfsFeedHandler

    this.gtfsrtFeed = gtfsrtFeed
    this.gtfsrtPump = new GTFSrtPump()

    this.converterStream = new ConverterStream(
        gtfsFeedHandler,
        this.gtfsrtPump,
        converterConfig,
        trainTrackerInitialState,
        converterUpdateListener.bind(this)
    )

    this.latestConverter = null

    this.nextConverterUpdate = this.newNextUpdate()
  }

  async open () {
    this.converterStream.start()
    return this
  }

  async next () {
    // Get the next GTFS-Realtime Message.
    const GTFSrt_JSON = await this.gtfsrtFeed.next()

    if (GTFSrt_JSON === null) {
      return null
    }

    const next = this.nextConverterUpdate()

    // Send the message to the converterStream
    this.gtfsrtPump.send(GTFSrt_JSON)

    this.nextConverterUpdate = this.newNextUpdate()
    return next
  }

  async close () {
    await this.gtfsrtFeed.close()
  }

  newNextUpdate () {
    return () => {
      return new Promise((resolve, reject) =>
        this.nextConverterUpdateFunctions = { resolve, reject }
      )
    }
  }
}


// Callback passed to MTA_Subway_GTFS-Realtime_to_SIRI.ConverterStream
function converterUpdateListener (converterUpdate) {

  const {
    resolve,
    reject
  } = this.nextConverterUpdateFunctions

  this.latestConverter = converterUpdate

  let gtfsrtJSON = converterUpdate && converterUpdate.GTFSrt && converterUpdate.GTFSrt.GTFSrt_JSON

  converterUpdate.getVehicleMonitoringResponse(siriRequestParams, 'json', (err, resp) => {
    if (err) {
      return reject(err)
    }

    let siriObj = JSON.parse(resp)

    resolve({
      gtfsrtJSON,
      siriObj,
      converterUpdate
    })
  })
}


class GTFSrtPump {

  constructor () {
    this.listeners = []
  }

  registerListener (fn) {
    this.listeners.push(fn)
  }

  removeListern (fn) {
    this.listeners = this.listeners.filter(_fn => _fn !== fn)
  }

  send (GTFSrt_JSON) {
    this.listeners.forEach(fn => fn(GTFSrt_JSON))
  }
}


module.exports = MockConverterServiceFactory

