const fs = require('fs')
const restify = require('restify')
const _ = require('lodash')

const { Transform } = require('stream')

const MongoClient = require('mongodb').MongoClient

const mongoURL = 'mongodb://localhost:27017/mta_subway_base_data'
const baseDataCollectionName = 'base_data'
const dotPlaceholder = '\u0466'
const MongoKeyHandler = require('./src/utils/MongoKeyHandler')
const mongoKeyHandler = new MongoKeyHandler(dotPlaceholder)

const server = restify.createServer({ name: "AVAIL Transit Analysis System" })

const projectedFields = [
  "gtfsrtKey",
  // "gtfsrtMsgTimestamp",
  // "positionTimestamp",
  "latitude",
  "longitude",
  "routeId",
]


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

  db.collection(baseDataCollectionName).find({}, {}, { sort: '_id' })//.limit(30)
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

server.listen('9009', () =>
  console.log('%s listening at %s', server.name, server.url)
)

