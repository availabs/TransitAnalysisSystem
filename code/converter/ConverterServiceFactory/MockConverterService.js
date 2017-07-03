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

const ConverterStream  = require('MTA_Subway_GTFS-Realtime_to_SIRI_Converter').ConverterStream

const siriRequestParams = {
  vehiclemonitoringdetaillevel: 'calls'
}

class MockConverterService {

  constructor (gtfsFeedHandler, gtfsrtFeed, trainTrackerInitialState, converterConfig) {

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

    // FIXME: Is try/catch guaranteed to work for all cases ???
    try {
      const GTFSrt_JSON = await this.gtfsrtFeed.next()

      if (GTFSrt_JSON === null) {
        return null
      }

      const next = this.nextConverterUpdate()

      // Send the message to the converterStream
      this.gtfsrtPump.send(GTFSrt_JSON)

      this.nextConverterUpdate = this.newNextUpdate()
      return next
    } catch (err) {
      console.log(err)
      return
    }
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


module.exports = MockConverterService

