#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const { Transform } = require('stream')
const csv = require('fast-csv')
const moment = require('moment')
const _ = require('lodash')

const MongoClient = require('mongodb').MongoClient

const mongoURL = 'mongodb://localhost:27017/mta_subway_base_data'
const baseDataCollectionName = 'base_data'
const dotPlaceholder = '\u0466'
const MongoKeyHandler = require('../code/utils/MongoKeyHandler')
const mongoKeyHandler = new MongoKeyHandler(dotPlaceholder)


// const outputFilePath = path.join(__dirname, '../nyt/data/basicTripInfo.20170615.csv')
const outputFilePath = path.join(__dirname, '../nyt/data/locations.20170615.csv')

const startTime = '2017-06-15 00:00:00'
const endTime = '2017-06-15 24:00:00'

const mongoQuery = {
  _id: {
    $gte: moment(startTime).unix(),
    $lt: moment(endTime).unix(),
  },
}


// Could not get the Mongo project to work with a wildcard.
// All fields
// const projectedFields = [
  // "gtfsKey",
  // "gtfsrtKey",
  // "gtfsrtMsgTimestamp",
  // "positionTimestamp",
  // "latitude",
  // "longitude",
  // "sta",
  // "eta",
  // "ata",
  // "routeId",
  // "stopId",
  // "atStop",
  // "distanceFromCall",
// ]


// basicTripInfo
// const projectedFields = [
  // 'gtfsrtKey',
  // 'gtfsrtMsgTimestamp',
  // 'positionTimestamp',
  // 'sta',
  // 'eta',
  // 'ata',
  // 'routeId',
  // 'stopId',
  // 'atStop',
// ]

// locations
const projectedFields = [
  "gtfsrtKey",
  "gtfsrtMsgTimestamp",
  "positionTimestamp",
  "latitude",
  "longitude",
  "routeId",
]


// Set selected routes to null for no filtering.
const selectedRoutes = [ 4, 5, 6 ]

const mongoOptions = {
  sort: '_id'
}


let db

MongoClient.connect(mongoURL)
  .then(
    (_db) => (db = _db)
  ).then(
    () => db.collection(baseDataCollectionName).find(mongoQuery, {}, mongoOptions)
            // .limit(1) // for testing
  )
  .then(
    (cursor) => cursor.stream()
  )
  .then(
    (dataStream) => handleDataStream(dataStream)
  ).then(
    () => db.close()
  ).then(
    () => console.log('done')
  ).catch(
    (err) => console.error(err)
  )


function handleDataStream (dataStream) {
  return new Promise((resolve, reject) => {

    dataStream.pipe(
      new Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        transform (chunk, encoding, callback) {
          const data = mongoKeyHandler.restoreKeys(chunk.state)

          Object.keys(data).sort()
            .forEach((tripId) => {
              // Set selected routes to null for no filtering.
              if (!selectedRoutes || selectedRoutes.includes(data[tripId].routeId)) {
                const fields = _.intersection(Object.keys(data[tripId]), projectedFields)
                const tripData = fields.reduce((acc, field) => {
                  acc[snakeCase(field)] = data[tripId][field]
                  return acc
                }, {})

                this.push(tripData)
              }
            })

          callback(null)
        }
      })
    ).pipe(
      csv.createWriteStream({
        discardUnmappedColumns: true,
        headers: true,
        ignoreEmpty: true,
        quoteColumns: true,
        strictColumnHandling: true,
      })
    ).pipe(
      // process.stdout // for debugging
      fs.createWriteStream(outputFilePath)
    ).on('error',
      reject
    ).on('finish',
      resolve
    )
  })
}

// https://jamesroberts.name/blog/2010/02/22/
function snakeCase (str) {
  return str.replace(/([A-Z])/g, ($1) => "_"+$1.toLowerCase())
}
