// Simple example Actor

'use strict'


class GTFSrtTimstampCrier {
  constructor ({ listeners } = {}) {
    const that = {
      listeners: listeners || []
    }

    this.registerListener = _registerListener.bind(that)
    this.receiveMessage = _receiveMessage.bind(that)
    this.teardown = _teardown.bind(that)
  }
}

function _registerListener (listener) {
  this.listeners.push(listener)
}

async function _receiveMessage ({ GTFSrt }) {
  this.listeners.forEach((listener) => {
    listener.receiveMessage(GTFSrt.getTimestampForFeedMessage())
  })
}

async function _teardown () {
  this.listeners = null
}


module.exports = GTFSrtTimstampCrier
