/* WARNING: This code has not yet been integrated into the new project structure. */

const fs = require('fs')
const restify = require('restify')
const _ = require('lodash')
const moment = require('moment')
const csv = require('fast-csv')


const { Transform } = require('stream')

const MongoClient = require('mongodb').MongoClient

const mongoURL = 'mongodb://transit-rw:password@localhost:27017/mta_subway_base_data'
const baseDataCollectionName = 'base_data'
const dotPlaceholder = '\u0466'
const MongoKeyHandler = require('./src/utils/MongoKeyHandler')
const mongoKeyHandler = new MongoKeyHandler(dotPlaceholder)

const server = restify.createServer({ name: "AVAIL Transit Analysis System" })

const projectedFields = [
  'gtfsrtKey',
  'gtfsrtMsgTimestamp',
  'positionTimestamp',
  'sta',
  'eta',
  'ata',
  'routeId',
  'stopId',
  'atStop',
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
  ).catch(
    (err) => {
      console.error(err)
      process.exit(1)
    }
  )


server.get('/locations', (req, res, next) => {

  db.collection(baseDataCollectionName).find({}, {}, { sort: '_id' }).limit(30)
    .stream()
    .pipe(
      new Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        transform (chunk, encoding, callback) {
          const timestamp = chunk._id
          const data = mongoKeyHandler.restoreKeys(chunk.state)

          const tripsData = Object.keys(data).map(
            (tripId) => {
              const fields = _.intersection(Object.keys(data[tripId]), projectedFields)
              return tripData = fields.reduce((acc, field) => {
                acc[field] = data[tripId][field]
                return acc
              }, {})
            })

          this.push(JSON.stringify({ [timestamp]: tripsData }) + '\n')
          callback(null)
        }
      })
    ).pipe(res)
})

server.get('/report/:date', (req, res, next) => {

  const startTime = `${req.params.date} 00:00:00`
  const endTime = `${req.params.date} 24:00:00`
  
  const mongoQuery = {
    _id: {
      $gte: moment(startTime).unix(),
      $lt: moment(endTime).unix(),
    },
  }

  // TODO: DRY this out. Copied directly from bin/writeCSVReport.js
  db.collection(baseDataCollectionName).find(mongoQuery, {}, { sort: '_id' })
    .stream()
    .pipe(
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
    ).pipe(res)
})

server.listen('9009', () =>
  console.log('%s listening at %s', server.name, server.url)
)

// https://jamesroberts.name/blog/2010/02/22/
function snakeCase (str) {
  return str.replace(/([A-Z])/g, ($1) => "_"+$1.toLowerCase())
}
