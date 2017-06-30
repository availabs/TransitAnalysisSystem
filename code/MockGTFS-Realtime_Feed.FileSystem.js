'use strict'

/*
 * This module is a mock of the GTFS-Realtime_Toolkit's FeedReader.
 * Rather than pull GTFS-realtime messages from a transit agency's server,
 * it pulls from GTFS Realtimes saved to the file system.
 */

const fs = require('fs')
const path = require('path')

const protofilePath = path.join(__dirname, '../../../proto_files/nyct-subway.proto')

const ProtoBuf = require('protobufjs')

const decoder =  ProtoBuf.protoFromFile(protofilePath)
                         .build('transit_realtime')
                         .FeedMessage.decode

function MockFeedReader (dataDirectory) {

    if (!fs.existsSync(dataDirectory)) {
      throw new Error(`dataDirectory ${dataDirectory} does not exist.`)
    }

    this.dataDirectory = dataDirectory
}


MockFeedReader.prototype.getTrainTrackerInitialState = (cb) => {
  process.nextTick(() => cb(null, {}))
}

MockFeedReader.prototype.start = function (cb) {

  fs.readdir(this.dataDirectory, (err, fileNames) => {
    if (err) {
      return cb(err)
    }

    this.dataFilesList = fileNames.sort().reverse()

    return cb(null)
  })
}


MockFeedReader.prototype.registerListener = function (listener) {
    if (typeof listener !== 'function') {
        throw new Error("Listeners must be functions.")
    }

    this.listener = listener
}


MockFeedReader.prototype.sendNext = function () {

    // returning null signals no more messages
    if (!this.dataFilesList.length) {
      return null
    }

    const dataFileName = this.dataFilesList.pop()
    const dataFilePath = path.join(this.dataDirectory, dataFileName)

    fs.readFile(dataFilePath, (err, data) => {
      if (err) {
        return this.listener(null)
      }

      try {
        const gtfsrt = decoder(data)
        return this.listener(gtfsrt)
      } catch (err2) {
        console.error(`WARNING: unable to decode file: ${dataFileName}`)
        // keep going
        return this.listener(null)
      }

    })
}



module.exports = MockFeedReader
