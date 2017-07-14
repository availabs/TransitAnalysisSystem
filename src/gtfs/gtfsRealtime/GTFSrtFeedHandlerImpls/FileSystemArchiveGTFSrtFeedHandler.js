'use strict'

/*
 * This module is a mock of the GTFS-Realtime_Toolkit's FeedReader.
 * Rather than pull GTFS-realtime messages from a transit agency's server,
 * it pulls from GTFS Realtimes saved to the file system.
 */

const util = require('util')
const fs = require('fs')
const path = require('path')

const ProtoBuf = require('protobufjs')

const readdir = util.promisify(fs.readdir)
const readFile = util.promisify(fs.readFile)

const GTFSrtFeedHandlerInterface = require('../GTFSrtFeedHandlerInterface')



class FileSystemArchiveGTFSrtFeedHandler extends GTFSrtFeedHandlerInterface {

  constructor (config) {
    // Keep these internal.
    super()

    const that = {
      protobufDecoder: config.protobufDecoder,
      dataDirectory: config.dataDirectory,
      dataFilesList: null,
    }

    that.protobufDecoder =
      ProtoBuf.protoFromFile(config.protofilePath)
        .build('transit_realtime')
        .FeedMessage.decode

    this.setQueryFilters = _setQueryFilters
    this.open = _open.bind(that)
    this.getTrainTrackerInitialState = _getTrainTrackerInitialState.bind(that)
    this.next = _next.bind(that)
    this.stream = _stream
    this.close = _close.bind(that)
  }
}


function _setQueryFilters () {
  throw new Error('Query filters not supported for the FileSystem Mock GTFS-Realtime Feed.')
}

// Simply checks to make sure the data directory exists, and gets a list of the files.
async function _open () {
  const dataFiles = await readdir(this.dataDirectory)
  this.dataFilesList = dataFiles.sort().reverse() // Reverse so we can use Array.prototype.pop
}

function _getTrainTrackerInitialState () {
  return new Promise((resolve) =>
    process.nextTick(() => resolve({}))
  )
}

async function _next () {
  if (!this.dataFilesList) {
    throw new Error('The FeedHandler is not open.')
  }

  // If the decoder fails on a message, go to the next file in the list.
  while (true) {
    if (!this.dataFilesList.length) {
      return null
    }

    try {
      const dataFileName = this.dataFilesList.pop()
      const dataFilePath = path.join(this.dataDirectory, dataFileName)

      const data = await readFile(dataFilePath)

      const gtfsrtJSON = this.protobufDecoder(data)

      return gtfsrtJSON
    } catch (err) {
      console.error(err)
    }
  }
}

function _stream () {
  return new Promise((resolve, reject) => {
    return reject(new Error('Stream is not supported on the FileSytem MockGTFS-Realtime Feed.'))
  })
}

function _close () {
  return new Promise((resolve) => {
    this.protobufDecoder = null
    this.dataDirectory = null
    this.dataFilesList = null
    return resolve()
  })
}

module.exports = FileSystemArchiveGTFSrtFeedHandler
