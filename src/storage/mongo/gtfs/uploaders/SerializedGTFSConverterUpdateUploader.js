'use strict'


class SerializedGTFSConverterUpdateUploader {
  constructor (config) {
    const that = {
      mongoKeyHandler: config.mongoKeyHandler,

      db: config.db,
      gtfsrtCollection: config.gtfsrtCollection,
      trainTrackerCollection: config.trainTrackerCollection,
    }

    this.receiveMessage = _receiveMessage.bind(that)
    this.teardown = _teardown.bind(that)
  }

  static registerListener () {
    throw new Error('This module does not accept listeners.')
  }
}


async function _receiveMessage ({ timestamp, GTFSrt_JSON, trainTrackerState }) {
  const id = { _id: timestamp }
  const gtfsrtDoc = { state: this.mongoKeyHandler.cleanKeys(GTFSrt_JSON) }
  const trainTrackerDoc = { state: this.mongoKeyHandler.cleanKeys(trainTrackerState) }

  await Promise.all([
    this.gtfsrtCollection.update(id, { $set: gtfsrtDoc }, { upsert: true}),
    this.trainTrackerCollection.update(id, { $set: trainTrackerDoc }, { upsert: true})
  ])
}

async function _teardown () {
  this.receiveMessage = _toreDownReciever

  await this.db.close()
  this.db = null

  this.gtfsrtCollection = null
  this.trainTrackerCollection = null
}

function _toreDownReciever () {
  throw new Error('This SerializedGTFSConverterUpdateUploader has been torn down.')
}


module.exports = SerializedGTFSConverterUpdateUploader
