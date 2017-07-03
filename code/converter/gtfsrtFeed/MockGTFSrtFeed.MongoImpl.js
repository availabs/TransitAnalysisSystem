'use strict'


const MongoClient = require('mongodb').MongoClient
const MongoKeyHandler = require('../../utils/MongoKeyHandler')

const configParams = [
  'mongoURL',
  'gtfsrtCollectionName',
  'trainTrackerCollectionName',
  'dotPlaceholder'
]


class FeedHandler {
  constructor (config) {
    Object.assign(this, _pluck(config, configParams))
    this.mongoKeyHandler = new MongoKeyHandler(this.dotPlaceholder)
  }

  setQueryFilters (filters) {
    this.gtfsrtQueryObj = filters.gtfsrtQueryObj
    this.trainTrackerQueryObject = filters.trainTrackerQueryObject
    this.resultsLimit = +filters.resultsLimit

    if (!Number.isFinite(this.resultsLimit)) {
      throw new Error('Invalid resultsLimit passed to setQueryFilters.')
    }
  }

  async open () {
    this.db = await MongoClient.connect(this.mongoURL)

    this.gtfsrtCollection = this.db.collection(this.gtfsrtCollectionName)
    this.trainTrackerCollection = this.db.collection(this.trainTrackerCollectionName)

    this.gtfsrtCursor = this.gtfsrtCollection.find(this.gtfsrtQueryObj, { sort: { _id: 1 } })

    if (Number.isFinite(this.resultsLimit)) {
      this.gtfsrtCursor = this.gtfsrtCursor.limit(this.resultsLimit)
    }
  }

  async getTrainTrackerInitialState () {
    if (!this.db) {
      throw new Error('No MongoDB connection.')
    }

    const sortRule = { sort: { _id: 1 } }

    const doc = await this.trainTrackerCollection.findOne(this.trainTrackerQueryObject, sortRule)

    const restoredData = this.mongoKeyHandler.restoreKeys(doc)
    return restoredData
  }

  async next () {
    if (!this.db) {
      throw new Error('No MongoDB connection.')
    }

    // If item === null, all data has been sent.
    const item = await this.gtfsrtCursor.nextObject()

    const state = item && this.mongoKeyHandler.restoreKeys(item.state)
    return state
  }

  // https://mongodb.github.io/node-mongodb-native/2.2/api/Cursor.html#stream
  stream () {
    return new Promise((resolve) => {
      process.nextTick(() => resolve(this.gtfsrtCursor.stream()))
    })
  }

  async close () {
    await this.db.close(true)

    this.gtfsrtCollection = null
    this.trainTrackerCollection = null
    this.gtfsrtCursor = null
    this.db = null
  }
}


function _pluck (obj, props) {
  return props.reduce((acc, prop) => {
    acc[prop] = obj[prop] || null
    return acc
  }, {})
}


module.exports = FeedHandler
