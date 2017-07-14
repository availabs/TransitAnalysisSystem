'use strict'


const _ = require('lodash')
const deepFreeze = require('deep-freeze')

const GTFSFeedHandlerInterface = require('../GTFSFeedHandlerInterface')


class FileSystemGTFSFeedHandler extends GTFSFeedHandlerInterface {
  constructor ({indexedScheduleData, indexedSpatialData}) {
    super()

    // These are exposed on the original GTFS Feed Handler
    //   and clients use them directly.
    // Hiding them, therefore, would violate the interface contract.
    // The best we can do is deep-freeze them:
    //    see: https://github.com/substack/deep-freeze
    const latestGTFSIndices = deepFreeze({
      indexedScheduleData,
      indexedSpatialData,
    })

    const that = {
      latestGTFSIndices,
      listeners: []
    }

    this.latestGTFSIndices = latestGTFSIndices
    this.registerListener = _registerListener.bind(that)
    this.removeListener = _removeListener.bind(that)
  }
}

function _registerListener (listener) {
  this.listeners.push(listener)
  listener(this.latestGTFSIndices)
}

function _removeListener (listener) {
  _.pull(this.listeners, listener)
}

module.exports = FileSystemGTFSFeedHandler
