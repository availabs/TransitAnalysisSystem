'use strict'

/*
 * This module is a mock of the GTFS-Realtime_Toolkit's FeedReader.
 * Rather than pull GTFS-realtime messages from a transit agency's server,
 * it pulls from GTFS Realtimes saved to the file system.
 */

const util = require('util')
const fs = require('fs')
const path = require('path')

const readdir = util.promisify(fs.readdir)
const readFile = util.promisify(fs.readFile)

const protofilePath = path.join(__dirname, '../../../../../proto_files/nyct-subway.proto')

const ProtoBuf = require('protobufjs')

const decoder =  ProtoBuf.protoFromFile(protofilePath)
                         .build('transit_realtime')
                         .FeedMessage.decode


class FeedHandler {
  constructor (config) {
    this.dataDirectory = config.dataDirectory
    this.dataFilesList = null
  }

  setQueryFilters () {
    throw new Error('Query filters not supported for the FileSystem Mock GTFS-Realtime Feed.')
  }

  // Simply checks to make sure the data directory exists, and gets a list of the files.
  async open () {
    const dataFilesList = await readdir(this.dataDirectory)
    this.dataFilesList = dataFilesList.sort().reverse()
  }

  getTrainTrackerInitialState () {
    return new Promise((resolve) =>
      process.nextTick(() => resolve({}))
    )
  }

  async next () {
    if (!this.dataFilesList) {
      throw new Error('The FeedHandler is not open.')
    }

    if (!this.dataFilesList.length) {
      return null
    }

    const dataFileName = this.dataFilesList.pop()
    const dataFilePath = path.join(this.dataDirectory, dataFileName)

    console.log(dataFileName)

    const data = await readFile(dataFilePath)

    const gtfsrtJSON = decoder(data)

    return gtfsrtJSON
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
