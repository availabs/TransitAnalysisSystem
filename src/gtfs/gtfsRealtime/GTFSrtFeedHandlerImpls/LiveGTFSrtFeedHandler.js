'use strict'

const EventEmitter = require('events')

const { FeedReader } = require('GTFS-Realtime_Toolkit')

const GTFSrtFeedHandlerInterface = require('../GTFSrtFeedHandlerInterface')

class FeedUpdateEventEmitter extends EventEmitter {}


class LiveGTFSrtFeedHandler extends GTFSrtFeedHandlerInterface {

  constructor (config) {
    super()

    const feedUpdateEventEmitter = new FeedUpdateEventEmitter()

    const gtfsrtFeedReader = new FeedReader(config)

    // hide the internal state
    const that = {
      gtfsrtFeedReader: gtfsrtFeedReader,
      gtfsrtMessageQueue: [],
      feedUpdateEventEmitter,
    }

    this.open = _open.bind(that)
    this.next = _next.bind(that)
    this.close = _close.bind(that)
  }

  setQueryFilters () {
    throw new Error('Query filters not supported for the Mock Live GTFS-Realtime Feed.')
  }

  getTrainTrackerInitialState () {
    return new Promise((resolve) =>
      process.nextTick(() => resolve({}))
    )
  }

  // https://mongodb.github.io/node-mongodb-native/2.2/api/Cursor.html#stream
  stream () {
    return new Promise((resolve, reject) => {
      return reject(new Error('Stream is not yet implemented on the Mock Live GTFS-Realtime Feed.'))
    })
  }

}

function _open () {
  return new Promise((resolve, reject) => {
    try {
      this.gtfsrtFeedReader.registerListener(gtfsrtFeedReaderListener.bind(this))
      return process.nextTick(() => resolve())
    } catch (err) {
      return reject(err)
    }
  })
}

function _next () {
  if (!this.gtfsrtFeedReader) {
    return Promise.reject(new Error('No active GTFS-Realtime Feed Reader opened.'))
  }

  // Because emit is synchronous, this is safe.
  if (this.gtfsrtMessageQueue.length) {
    const GTFSrt_JSON = this.gtfsrtMessageQueue.shift()
    return Promise.resolve(GTFSrt_JSON)
  }

  return new Promise((resolve) =>
    // https://nodejs.org/api/events.html#events_asynchronous_vs_synchronous
    //    "The EventListener calls all listeners synchronously
    //      in the order in which they were registered."
    this.feedUpdateEventEmitter.once('update', () => {
      const GTFSrt_JSON = this.gtfsrtMessageQueue.shift()
      return resolve(GTFSrt_JSON)
    })
  )
}

function _close () {
  return new Promise((resolve, reject) => {
    try {
      this.gtfsrtFeedReader.removeListener(this.gtfsrtFeedReaderListener)
      this.gtfsrtFeedReader = null
      this.gtfsrtMessageQueue = null
      return process.nextTick(() => resolve())
    } catch (err) {
      return process.nextTick(() => reject(err))
    }
  })
}

// Don't want to expose this to Feed clients.
function gtfsrtFeedReaderListener (GTFSrt_JSON) {
  // Because it is not guaranteed that there is a listener on the eventEmitter
  //   when the msg is received, we need to put them in a queue.
  this.gtfsrtMessageQueue.push(GTFSrt_JSON)

  // https://nodejs.org/api/events.html#events_emitter_emit_eventname_args
  //   "Synchronously calls each of the listeners registered for the event named eventName,
  //     in the order they were registered, passing the supplied arguments to each."
  this.feedUpdateEventEmitter.emit('update')
}

module.exports = LiveGTFSrtFeedHandler
