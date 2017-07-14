'use strict'

const EventEmitter = require('events')

const ConverterStream  = require('MTA_Subway_GTFS-Realtime_to_SIRI_Converter').ConverterStream

class ConverterUpdateEventEmitter extends EventEmitter {}


class GTFSConverterService {

  constructor ({ gtfsFeedHandler, gtfsrtFeedHandler, trainTrackerInitialState, gtfsConverterConfig }) {

    const converterUpdateEventEmitter = new ConverterUpdateEventEmitter()

    const gtfsrtPump = new GTFSrtPump()

    const that = {
      gtfsrtFeedHandler,
      gtfsrtPump,
      converterUpdateEventEmitter,
    }

    that.converterStream = new ConverterStream(
      gtfsFeedHandler,
      gtfsrtPump,
      gtfsConverterConfig,
      trainTrackerInitialState,
      converterUpdateListener.bind({ converterUpdateEventEmitter })
    )

    this.open = _open.bind(that)
    this.next = _next.bind(that)
    this.close = _close.bind(that)
  }
}


async function _open () {
  this.converterStream.start()
  return this
}

async function _next () {
  // Get the next GTFS-Realtime Message.

  let hasMoreData

  try {
    // Get the latest GTFSrt object from the feed.
    const GTFSrt_JSON = await this.gtfsrtFeedHandler.next()

    hasMoreData = !!GTFSrt_JSON

    // Following MongoDB Cursor convention, null means iterable done.
    if (GTFSrt_JSON === null) {
      return null
    }

    const converterUpdatePromise = new Promise((resolve) =>
      this.converterUpdateEventEmitter.once('update', resolve)
    )

    // Send the GTFSrt message to the converterStream
    this.gtfsrtPump.send(GTFSrt_JSON)

    // Return the promise to be resolved by the GTFSrt_JSON conversion
    return await converterUpdatePromise
  } catch (err) {
    console.log(err)
    return hasMoreData ? undefined : null
  }
}

async function _close () {
  // FIXME ??? Should this be converterSteam.close()
  await this.gtfsrtFeedHandler.close()
}

// Callback passed to MTA_Subway_GTFS-Realtime_to_SIRI.ConverterStream
// This bound to the converterService's this
function converterUpdateListener (converterUpdate) {
  return this.converterUpdateEventEmitter.emit('update', converterUpdate)
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
    this.listeners.forEach(listener => listener(GTFSrt_JSON))
  }
}

module.exports = GTFSConverterService

