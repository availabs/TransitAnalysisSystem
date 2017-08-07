// TODO: Handle WriteStream error events.

'use strict'


const { createWriteStream } = require('fs')


class FSScribe {
  constructor ({ path }) {
    const that = {
      wstream: createWriteStream(path)
    }

    this.receiveMessage = _receiveMessage.bind(that)
    this.teardown = _teardown.bind(that)
  }
}


async function _receiveMessage (msg) {
  if (!this.wstream.write(JSON.stringify(msg) + '\n')) {
    return new Promise(resolve => {
      this.wstream.once('drain', resolve)
    })
  }
}

async function _teardown () {
  return new Promise(resolve => {
    this.wstream.end(resolve)
  })
}


module.exports = FSScribe
