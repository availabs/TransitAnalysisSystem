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


const process = require('process')
const path = require('path')
const _ = require('lodash')
const async = require('async')

const ConverterStream  = require('MTA_Subway_GTFS-Realtime_to_SIRI_Converter').ConverterStream

const GTFS_FeedHandlerService = require(path.join(__dirname, '../../../src/services/GTFS_FeedHandlerService'))

const mockConfigService = require(path.join(__dirname, 'MockConfigsService'))

const converterConfig  = mockConfigService.getConverterConfig()

let gtfsFeedHandler

let converterStream


GTFS_FeedHandlerService.start()

gtfsFeedHandler = GTFS_FeedHandlerService.getFeedHandler()



let latestConverter = null


let listeners = []


// Listeners should be functions with the following signature: f(err, gtfsrtJSON, siriJSON, converterCache)
function registerListener (listener) {
  if (!_.isFunction(listener))  {
    throw new Error('Listeners must be functions.')
  }

  listeners.push(listener)
}


function start (mockGTFSrtFeed) {

  mockGTFSrtFeed.open(function (err) {

    if (err) {
      console.error(err)
      process.exit(1)
    }

    mockGTFSrtFeed.getTrainTrackerInitialState((err2, trainTrackerInitialState) => {
      if (err2) {
        console.error(err2)
        process.exit(1)
      }

      converterStream = new ConverterStream(
          gtfsFeedHandler,
          mockGTFSrtFeed,
          converterConfig,
          trainTrackerInitialState,
          converterUpdateListener.bind({ mockGTFSrtFeed })
      )

      mockConfigService.removeTrainTrackerInitialStateFromConverterConfig()

      mockConfigService.addConverterConfigUpdateListener(function (config) {
        converterStream.updateConfig(config)
      })

      converterStream.start()

      //start the feed messages.
      if (mockGTFSrtFeed.sendNext() === null) {
        console.log('These are no messages in the mock feed.')
      }
    })
  })
}


// Callback passed to MTA_Subway_GTFS-Realtime_to_SIRI.ConverterStream
function converterUpdateListener (converterUpdate) {

  if (converterUpdate) {
    latestConverter = converterUpdate
  } else  {
    if (this.mockGTFSrtFeed.sendNext() === null) {
      console.log('All messages sent. (App should terminate.)')
    }
    return
  }

  let gtfsrtJSON = converterUpdate && converterUpdate.GTFSrt && converterUpdate.GTFSrt.GTFSrt_JSON

  const config = {
    vehiclemonitoringdetaillevel: 'calls'
  }

  converterUpdate.getVehicleMonitoringResponse(config, 'json', (err, resp) => {
    if (err) {
      console.error(err)
    }

    let siriObj = JSON.parse(resp)

    const iteratee = (listener, cb) => listener(null, gtfsrtJSON, siriObj, converterUpdate, cb)

    async.each(listeners, iteratee, _handleAllListenersDone.bind(this))
  })
}


function _handleAllListenersDone (err2) {
  if (err2) {
    console.error(err2)
    throw err2
  }

  // Signal the mock GTFSrt feed to send another message.
  if (this.mockGTFSrtFeed.sendNext() === null) {
    console.log('All messages sent. (App should terminate.)')
  }
}


function getStopMonitoringResponse (query, extension, callback) {
  latestConverter.getStopMonitoringResponse(query, extension, callback)
}

function getVehicleMonitoringResponse (query, extension, callback) {
  latestConverter.getVehicleMonitoringResponse(query, extension, callback)
}

function getCurrentGTFSRealtimeTimestamp () {
  return latestConverter.getCurrentGTFSRealtimeTimestamp()
}

function getState () {
  return latestConverter.getState()
}



module.exports = {
  registerListener,
  start,
  getStopMonitoringResponse,
  getVehicleMonitoringResponse,
  getCurrentGTFSRealtimeTimestamp,
  getState,
}
