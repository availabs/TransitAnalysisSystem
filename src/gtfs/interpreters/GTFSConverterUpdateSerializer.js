'use strict'


const deepFreeze = require('deep-freeze')


class GTFSConverterUpdateSerializer {
  constructor (config = {}) {
    const that = {
      listeners: config.listeners || []
    }

    this.registerListener = _registerListener.bind(that)
    this.receiveMessage = _receiveMessage.bind(that)
    this.teardown = _teardown.bind(that)
  }
}


function _registerListener (listener) {
  this.listeners.push(listener)
}

async function _receiveMessage (converterUpdate) {
  // TODO: get rid of these and use the getters on the wrapperObjects
  const { GTFSrt_JSON } = converterUpdate.GTFSrt

  if (!GTFSrt_JSON) {
    return
  }

  const timestamp = converterUpdate.GTFSrt.getTimestampForFeedMessage()

  const trainTrackerState = JSON.parse(converterUpdate.getState().toString()).trainTrackerState

  // make immutable
  const outMsg = deepFreeze({
    timestamp,
    GTFSrt_JSON,
    trainTrackerState,
  })

  await Promise.all(
    this.listeners.map(
      (listener) => listener.receiveMessage(outMsg)
    )
  )
}

async function _teardown () {
  this.lastTimestamp = Number.NEGATIVE_INFINITY

  this.gtfsrtCollection = null
  this.trainTrackerCollection = null
}


module.exports = GTFSConverterUpdateSerializer
