// !!! WARNING: This code has yet to be run.

'use strict'

const pathToConverterModule = '../../../node_modules/MTA_Subway_GTFS-Realtime_to_SIRI_Converter'

const GTFSrtFeedReader = require(pathToConverterModule).MTA_Subway_GTFS_Realtime_Toolkit.FeedReader


class FeedHandler {
  constructor (config) {
    this.config = config
    this.gtfsrtMessageQueue = []
    this.gtfsrtFeedReader = null
  }

  setQueryFilters () {
    throw new Error('Query filters not supported for the FileSystem Mock GTFS-Realtime Feed.')
  }

  open () {
    return new Promise((resolve, reject) => {
      if (this.gtfsrtFeedReader) {
        return process.nextTick(() => resolve())
      }

      try {
        this.gtfsrtFeedReader = new GTFSrtFeedReader(this.config)
        this.gtfsrtFeedReader.registerListener(gtfsrtFeedReaderListener.bind(this))
        return process.nextTick(() => resolve())
      } catch (err) {
        return reject(err)
      }
    })
  }

  getTrainTrackerInitialState () {
    return new Promise((resolve) =>
      process.nextTick(() => resolve({}))
    )
  }

  next () {
    return new Promise((resolve, reject) => {
      if (!this.gtfsrtFeedReader) {
        reject(new Error('No active GTFS-Realtime Feed Reader opened.'))
      }

      let timeout = setInterval(() => {
        if (this.gtfsrtMessageQueue.length) {
          clearInterval(timeout)

          const GTFSrt_JSON = this.gtfsrtMessageQueue.shift()
          resolve(GTFSrt_JSON)
        }
      }, 100)
    })
  }

  // https://mongodb.github.io/node-mongodb-native/2.2/api/Cursor.html#stream
  stream () {
    return new Promise((resolve, reject) => {
      return reject(new Error('Stream is not supported on the FileSytem MockGTFS-Realtime Feed.'))
    })
  }

  close () {
    return new Promise((resolve, reject) => {
      try {
        this.gtfsrtFeedReader.removeListener(this.gtfsrtFeedReaderListener)
        this.gtfsrtFeedReader = null
        this.gtfsrtMessageQueue.length = 0
        return process.nextTick(() => resolve())
      } catch (err) {
        return process.nextTick(() => reject(err))
      }
    })
  }
}


function gtfsrtFeedReaderListener (GTFSrt_JSON) {
  this.gtfsrtMessageQueue.push(GTFSrt_JSON)
}

module.exports = FeedHandler
