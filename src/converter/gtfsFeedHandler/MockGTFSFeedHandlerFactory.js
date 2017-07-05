'use strict'

'use strict'

const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const JSONStream = require('JSONStream')
const es = require('event-stream')

const mockConfigService = require(path.join(__dirname, '../configsService/MockConfigsService'))

const {
  indexedScheduleDataFilePath: scheduleDataFilePath,
  indexedSpatialDataFilePath: spatialDataFilePath,
} = mockConfigService.getGTFSConfig()

class GTFS_FeedHandlerFactory {

  constructor () {
    throw new Error('The build method is static.')
  }

  static async build () {
    const [
      indexedScheduleData,
      indexedSpatialData
    ] = await Promise.all(
      [readFile(scheduleDataFilePath), readFile(spatialDataFilePath)]
    )

    return new MockGTFS_FeedHandler(indexedScheduleData, indexedSpatialData)
  }
}

class MockGTFS_FeedHandler {
  constructor (indexedScheduleData, indexedSpatialData) {
    this.latestGTFSIndices = {
      indexedScheduleData,
      indexedSpatialData,
    }
    this.listeners = []
  }

  registerListener (listener) {
    this.listeners.push(listener)
    listener(this.latestGTFSIndices)
  }

  removeListener (listener) {
    _.pull(this.listeners, listener)
  }
}

function readFile (filePath) {
  return new Promise((resolve, reject) => {
    const idx = {}

    console.log('Loading', filePath)
    fs.createReadStream(filePath)
      .pipe(
        JSONStream.parse([true, { emitPath: true }])
      ).pipe(es.mapSync((data) => {
        _.set(idx, data.path, data.value)
      })).on('end', () => {
        resolve(idx)
      }).on('error', (err) => {
        reject(err)
      })
  })
}

module.exports = GTFS_FeedHandlerFactory
