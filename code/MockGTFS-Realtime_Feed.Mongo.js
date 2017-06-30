'use strict'


const MongoClient = require('mongodb').MongoClient
const MongoKeyHandler = require('./utils/MongoKeyHandler')


const configParams = [
  'mongoURL',
  'gtfsrtCollectionName',
  'trainTrackerCollectionName',
  'dotPlaceholder'
]


class MockFeedReader {
  constructor (config) {
    Object.assign(this, _pluck(config, configParams))
    this.mongoKeyHandler = new MongoKeyHandler(this.dotPlaceholder)
  }

  registerListener (listener) {
    if (typeof listener !== 'function') {
      throw new Error("Listeners must be functions.")
    }

    (this.listeners || (this.listeners = [])).push(listener)
  }

  setQueryFilters (queries) {
    this.gtfsrtQueryObj = queries.gtfsrtQueryObj
    this.trainTrackerQueryObject = queries.trainTrackerQueryObject
  }

  open (cb) {
    MongoClient.connect(this.mongoURL, (err, db) => {
      if(err) {
       return cb(err)
      }

      this.db = db
      this.gtfsrtCollection = db.collection(this.gtfsrtCollectionName)

      this.gtfsrtCursor = this.gtfsrtCollection.find({}, { sort: { _id: 1 } })

      return cb()
    })
  }

  getTrainTrackerInitialState (cb) {
    if (!this.db) {
      return cb(new Error('No MongoDB connection.'))
    }

    let trainTrackerCollection = this.db.collection(this.trainTrackerCollectionName)

    trainTrackerCollection.findOne(this.trainTrackerQueryObject, { sort: { _id: 1 } }, (err, doc) => {
      if (err) {
        console.error(err.stack || err)
        return cb(err)
      }

      return cb(null, this.mongoKeyHandler.restoreKeys(doc))
    })
  }

  sendNext () {
    if (!this.db) {
      throw new Error('No MongoDB connection.')
    }

    this.gtfsrtCursor.nextObject((err1, item) => {
      if (err1) {
        throw err1
      }

      if (item === null) {
        this.close()
        return null
      }

      if (!Array.isArray(this.listeners) && this.listeners.length) {
        return
      }

      const state = this.mongoKeyHandler.restoreKeys(item.state)

      for (let i = 0; i < this.listeners.length; ++i) {
        this.listeners[i](state)
      }
    })
  }

  close () {
    _teardown.call(this)
  }
}


function _teardown () {
  this.gtfsrtCursor.close((err2) => {
    this.db.close()
    if (err2) {
      throw err2
    }
  })
}

function _pluck (obj, props) {
  return props.reduce((acc, prop) => {
    acc[prop] = obj[prop] || null
    return acc
  }, {})
}


module.exports = MockFeedReader
