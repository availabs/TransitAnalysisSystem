'use strict'

/*
 * This module is a mock of the GTFS-Realtime_Toolkit's FeedReader.
 * Rather than pull GTFS-realtime messages from a transit agency's server,
 * it pulls from GTFS Realtimes saved to the file system.
 */

const fs = require('fs')
const path = require('path')

const protofilePath = path.join(__dirname, '../../../../../proto_files/nyct-subway.proto')

const ProtoBuf = require('protobufjs')

const GTFSrtFeedHandlerInterface = require('./MockGTFSrtFeed.Interface')

const decoder =  ProtoBuf.protoFromFile(protofilePath)
                         .build('transit_realtime')
                         .FeedMessage.decode


class FeedHandler extends GTFSrtFeedHandlerInterface {
  constructor (config) {
    this.dataDirectory = config.dataDirectory
  }

  setQueryFilters () {
    throw new Error('Query filters not supported for the FileSystem Mock GTFS-Realtime Feed.')
  }

  // Simply checks to make sure the data directory exists, and gets a list of the files.
  open () {
    return new Promise((resolve, reject) => {
      fs.readdir(this.dataDirectory, (err, fileNames) => {
        if (err) {
          return reject(err)
        }

        this.dataFilesList = fileNames.sort().reverse()

        return resolve(null)
      })
    })
  }

  getTrainTrackerInitialState () {
    return new Promise((resolve) =>
      process.nextTick(() => resolve({}))
    )
  }

  next () {
    return new Promise((resolve, reject) => {

      if (!this.dataFilesList.length) {
        return resolve(null)
      }

      const dataFileName = this.dataFilesList.pop()
      const dataFilePath = path.join(this.dataDirectory, dataFileName)

      fs.readFile(dataFilePath, (err1, data) => {
        if (err1) {
          return reject(err1)
        }

        try {
          const gtfsrt = decoder(data)
          return this.listener(gtfsrt)
        } catch (err2) {
          return reject(err2)
        }
      })
    })
  }

  stream () {
    return new Promise((resolve, reject) => {
      return reject(new Error('Stream is not supported on the FileSytem MockGTFS-Realtime Feed.'))
    })
  }

  close () {
    return new Promise((resolve) => {
      return resolve()
    })
  }
}


module.exports = FeedHandler
