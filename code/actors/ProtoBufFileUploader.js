'use strict'


const MongoClient = require('mongodb').MongoClient
const mongoURL = "mongodb://localhost:27017/mta_subway"

const MongoKeyHandler = require('./utils/MongoKeyHandler')


const dotPlaceholder = '\u0466'

let lastTimestamp = null


function feedListener (err, gtfsrtJSON, siriJSON, converterCache, cb) {
  if (err) {
    console.error(err)
    return cb()
  }

  if (!gtfsrtJSON) {
    return cb()
  }

  const timestamp = parseInt(gtfsrtJSON.header.timestamp)

  if (timestamp <= lastTimestamp) {
    return cb()
  }

  lastTimestamp = timestamp

  // Connect to the db
  MongoClient.connect(mongoURL, function (err2, db) {
    if(err2) {
      console.error(err2)
      return cb(err2)
    }

    const gtfsrtCollection = db.collection('gtfsrt')
    const trainTrackerCollection = db.collection('trainTracker')

    const trainTrackerState = JSON.parse(converterCache.getState().toString()).trainTrackerState

    const id = { _id: timestamp }
    const gtfsrtDoc = { state: cleanKeys(gtfsrtJSON) }
    const trainTrackerDoc = { state: cleanKeys(trainTrackerState) }

    gtfsrtCollection.update(id, gtfsrtDoc, { upsert: true}, (err3) => {
      if (err3) {
        db.close()
        return cb(err3)
      } else {
        trainTrackerCollection.update(id, trainTrackerDoc, { upsert: true}, (err4) => {
          db.close()
          if (err4) {
            return cb(err4)
          }
          return cb(null)
        })
      }
    })
  })
}


// Because mongo keys cannot contain a '.'.
function cleanKeys (obj) {

  let keys = ((obj !== null) && (typeof obj === 'object')) ? Object.keys(obj) : null

  if (keys) {
    return keys.reduce(function (acc, key) {
      acc[key.replace(/\./g, dotPlaceholder)] = cleanKeys(obj[key])
      return acc
    }, Array.isArray(obj) ? [] : {})
  } else {
    return obj
  }
}

module.exports = feedListener
