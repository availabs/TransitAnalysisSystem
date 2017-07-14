// WARNING: Unused code. Never executed....

'use strict'

const _ = require('lodash')


class MessageSplitter {
  constructor ({ listeners = {} }) {
    const that = {
      listeners: listeners
    }

    this.receiveMessage = _receiveMessage.bind(that)
    this.registerListener = _registerListener.bind(that)
    this.teardown = _teardown.bind(that)
  }
}

function _registerListener ({ paths, listener }) {
  paths = Array.isArray(paths)
    ? paths.slice().sort()
    : [paths]

  const key = JSON.stringify(paths);

  (this.listeners[key] || (this.listeners[key] = [])).push(listener)
}

async function _receiveMessage (msg) {
  Object.keys(this.listeners).forEach(
    (paths) => {
      const subset = _.pick(msg, JSON.parse(paths))
      if (!_.isEmpty(subset)) {
        this.listeners[paths](subset)
      }
    }
  )
}

async function _teardown () {
  this.listeners = null
}


module.exports = MessageSplitter

