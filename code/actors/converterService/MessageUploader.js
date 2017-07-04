'use strict'

const MongoClient = require('mongodb').MongoClient
const MongoKeyHandler = require('../../utils/MongoKeyHandler')

class MessageUploader {

  constructor (config) {
    this.config = config
    this.cleanKeys = new MongoKeyHandler(config.dotPlaceholder).cleanKeys

    this.lastTimestamp = Number.NEGATIVE_INFINITY

    this.db = null
    this.gtfsrtCollection = null
    this.trainTrackerCollection = null
  }

  async receiveMessage (gtfsrtJSON, siriJSON, converterCache) {

    if (!gtfsrtJSON) {
      return
    }

    const timestamp = parseInt(gtfsrtJSON.header.timestamp.low)

    // CONSIDER: Should we require sorted order of messages ???
    if (timestamp <= this.lastTimestamp) {
      return
    }

    this.lastTimestamp = timestamp

    if (!this.db) {
      await _connectToMongo.call(this)
    }

    const trainTrackerState = JSON.parse(converterCache.getState().toString()).trainTrackerState

    const id = { _id: timestamp }
    const gtfsrtDoc = { state: this.cleanKeys(gtfsrtJSON) }
    const trainTrackerDoc = { state: this.cleanKeys(trainTrackerState) }

    console.log('uploading', timestamp)
    await this.gtfsrtCollection.update(id, gtfsrtDoc, { upsert: true})
    await this.trainTrackerCollection.update(id, trainTrackerDoc, { upsert: true})

    return
  }

  async teardown () {
    console.log('TEARDOWN')
    this.lastTimestamp = Number.NEGATIVE_INFINITY

    this.gtfsrtCollection = null
    this.trainTrackerCollection = null

    await this.db.close()
    this.db = null
  }
}

async function _connectToMongo () {
  this.db = await MongoClient.connect(this.config.mongoURL)
  this.gtfsrtCollection = this.db.collection(this.config.gtfsrtCollectionName)
  this.trainTrackerCollection = this.db.collection(this.config.trainTrackerCollectionName)
}


module.exports = MessageUploader
