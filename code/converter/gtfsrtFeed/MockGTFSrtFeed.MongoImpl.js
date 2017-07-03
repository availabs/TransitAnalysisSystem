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

  setQueryFilters (queries) {
    this.gtfsrtQueryObj = queries.gtfsrtQueryObj
    this.trainTrackerQueryObject = queries.trainTrackerQueryObject
    this.resultsLimit = +queries.resultsLimit

    if (!Number.isFinite(this.resultsLimit)) {
      throw new Error('Invalid resultsLimit passed to setQueryFilters.')
    }
  }

  open () {
    return new Promise((resolve, reject) => {
      if (this.db) {
        return process.nextTick(resolve())
      }

      MongoClient.connect(this.mongoURL, (err, db) => {
        if(err) {
          return reject(err)
        }

        try {
          this.db = db
          this.gtfsrtCollection = db.collection(this.gtfsrtCollectionName)
          this.trainTrackerCollection = db.collection(this.trainTrackerCollectionName)

          this.gtfsrtCursor = this.gtfsrtCollection.find(this.gtfsrtQueryObj, { sort: { _id: 1 } })

          if (Number.isFinite(this.resultsLimit)) {
            this.gtfsrtCursor = this.gtfsrtCursor.limit(this.resultsLimit)
          }

          return resolve()

        } catch (err2) {
          return reject(err2)
        }
      })
    })
  }

  getTrainTrackerInitialState () {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return reject(new Error('No MongoDB connection.'))
      }

      const sortRule = { sort: { _id: 1 } }

      const _handler = (err, doc) => {
        if (err) {
          return reject(err)
        }

        const restoredData = this.mongoKeyHandler.restoreKeys(doc)

        return resolve(restoredData)
      }

      try {
        this.trainTrackerCollection.findOne(this.trainTrackerQueryObject, sortRule, _handler)
      } catch (err) {
        return reject(err)
      }

    })
  }

  next () {
    return new Promise((resolve, reject) => {

      if (!this.db) {
        return reject(Error('No MongoDB connection.'))
      }

      this.gtfsrtCursor.nextObject((err1, item) => {
        if (err1) {
          return reject(err1)
        }

        if (item === null) {
          return resolve(null)
        }

        const state = this.mongoKeyHandler.restoreKeys(item.state)

        return resolve(state)
      })
    })
  }

  // https://mongodb.github.io/node-mongodb-native/2.2/api/Cursor.html#stream
  stream () {
    return new Promise((resolve) => {
      return resolve(this.gtfsrtCursor.stream())
    })
  }

  close () {
    return new Promise((resolve, reject) => {
      // https://mongodb.github.io/node-mongodb-native/2.2/api/Db.html#close
      this.db.close(true, (err) => {
        this.db = null
        if (err) {
          return reject(err)
        }

        resolve()
      })
    })
  }
}


function _pluck (obj, props) {
  return props.reduce((acc, prop) => {
    acc[prop] = obj[prop] || null
    return acc
  }, {})
}


module.exports = FeedHandler
