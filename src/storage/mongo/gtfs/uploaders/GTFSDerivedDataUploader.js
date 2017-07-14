'use strict'


class GTFSDerivedDataUploader {
  constructor (config) {
    const that = {
      mongoKeyHandler: config.mongoKeyHandler,

      lastTimestamp: Number.NEGATIVE_INFINITY,

      db: config.db,
      derivedDataCollection: config.derivedDataCollection,
    }

    this.receiveMessage = _receiveMessage.bind(that)
    this.teardown = _teardown.bind(that)
  }

  static registerListener () {
    throw new Error('This module does not accept listeners.')
  }
}


async function _receiveMessage ({ timestamp, derivedData }) {
  const id = { _id: timestamp }
  const doc = { state: this.mongoKeyHandler.cleanKeys(derivedData) }

  await this.derivedDataCollection.update(id, { $set: doc }, { upsert: true})
}

async function _teardown () {
  this.receiveMessage = _toreDownReciever

  await this.db.close()
  this.db = null

  this.derivedDataCollection = null
}

function _toreDownReciever () {
  throw new Error('This GTFSDerivedDataUploader has been torn down.')
}


module.exports = GTFSDerivedDataUploader
