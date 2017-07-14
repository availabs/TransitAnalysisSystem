'use strict'


const stringify = require('json-stable-stringify')

const GTFSFeedSource = require('../GTFSFeedSource')

const FileSystemGTFSFeedHandler = require('../GTFSFeedHandlerImpls/FileSystemGTFSFeedHandler')
const LargeFileReader = require('../../../utils/LargeFileReader')

const _FILEHandlerCache = new WeakMap()

class GTFSFeedHandlerFactory {

  constructor () {
    throw new Error('The build method is static.')
  }

  // If multiple GTFSrt feeds share a GTFS Static feed, set share to true.
  static async build (gtfsConfig) {
    switch (gtfsConfig.source) {

    case GTFSFeedSource.FILE:
      return _buildFileSystemGTFSFeedHandler(gtfsConfig)
    default:
      throw new Error('Unrecognized source')
    }
  }
}


async function _buildFileSystemGTFSFeedHandler (gtfsConfig) {

  const {
    indexedScheduleDataFilePath,
    indexedSpatialDataFilePath,
    share,
  } = gtfsConfig

  const id = share && stringify({ indexedScheduleDataFilePath, indexedSpatialDataFilePath })

  if (id && _FILEHandlerCache.has(id)) {
    return _FILEHandlerCache.get(id)
  }

  // FIXME: If the Factory gets a second request for a shared FeedHandler while 
  //        it is building the to-be-shared handler, it will create a copy.
  //        Need a '_building' list that will cause new requests to await the
  //        intially requested handler. We can use a promise for this.

  // We do this here so that the FileSystemGTFSFeedHandler constructor can be synchronous.
  const [
    indexedScheduleData,
    indexedSpatialData
  ] = await Promise.all([
      LargeFileReader.parse(indexedScheduleDataFilePath),
      LargeFileReader.parse(indexedSpatialDataFilePath),
    ])

  const gtfsHander = new FileSystemGTFSFeedHandler({ indexedScheduleData, indexedSpatialData })

  if (id) {
    _FILEHandlerCache.set(id, gtfsHander)
  }

  return gtfsHander
}

module.exports = GTFSFeedHandlerFactory
