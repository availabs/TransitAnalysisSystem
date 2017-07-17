/* WARNING: This code has not yet been integrated into the new project structure. */

const restify = require('restify')
const _ = require('lodash')
const moment = require('moment')
const csv = require('fast-csv')


const corsMiddleware = require('restify-cors-middleware')

const feedName = 'mta_subway'

const { Transform } = require('stream')

const MongoClient = require('mongodb').MongoClient

const MongoUserConfigFactory = require('../config/mongo/MongoUserConfigFactory')
const MongoKeyHandler = require('../utils/MongoKeyHandler')

const mongoConfig = MongoUserConfigFactory.build({ feedName, userLevel: 'READ_ONLY' })

const {
  mongoURL,
  dotPlaceholder,
  gtfsrtCollectionName,
  derivedDataCollectionName,
} = mongoConfig


const server = restify.createServer({ name: "AVAIL Transit Analysis System" })

const cors = corsMiddleware({
  origins: ['*'],
  allowHeaders: ['API-Token'],
  exposeHeaders: ['API-Token-Expiry']
})

server.pre(cors.preflight)
server.use(cors.actual)


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

const mongoKeyHandler = new MongoKeyHandler(dotPlaceholder)


server.get('/report/:startTime', handleDerivedDataRequest)
server.get('/report/:startTime/to/:endTime', handleDerivedDataRequest)

server.get('/raw/:startTime', handleRawDataRequest)
server.get('/raw/:startTime/to/:endTime', handleRawDataRequest)

server.listen('9009', () =>
  console.log('%s listening at %s', server.name, server.url)
)


function handleRawDataRequest (req, res, next) {
  const mongoQuery = {
    _id: {
      $gte: moment(req.params.startTime).unix(),
    },
  }

  if (req.params.endTime) {
    mongoQuery._id.$lt = moment(req.params.endTime).unix()
  }

  console.log(moment(req.params.startTime))
  console.log(moment(req.params.endTime))
  console.log(mongoQuery)

  // TODO: DRY this out. Copied directly from bin/writeCSVReport.js
  db.collection(gtfsrtCollectionName)
    .find(mongoQuery, {}, { sort: '_id' })
    .stream()
    .pipe(
      new Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        transform (chunk, encoding, callback) {
          const data = mongoKeyHandler.restoreKeys(chunk.state)
          this.push(new Buffer(JSON.stringify(data)))
          callback(null)
        }
      })
    ).pipe(res)
    .on('end', next)
}



function handleDerivedDataRequest (req, res, next) {
  const mongoQuery = {
    _id: {
      $gte: moment(req.params.startTime).unix(),
    },
  }

  if (req.params.endTime) {
    mongoQuery._id.$lt = moment(req.params.endTime).unix()
  }

  console.log(moment(req.params.startTime))
  console.log(moment(req.params.endTime))
  console.log(mongoQuery)

  // TODO: DRY this out. Copied directly from bin/writeCSVReport.js
  db.collection(derivedDataCollectionName)
    .find(mongoQuery, {}, { sort: '_id' })
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
              const fields = _.intersection(Object.keys(data[tripId]), projectedFields)
              const tripData = fields.reduce((acc, field) => {
                acc[snakeCase(field)] = data[tripId][field]
                return acc
              }, {})

              this.push(tripData)
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
    .on('end', next)
}


// https://jamesroberts.name/blog/2010/02/22/
function snakeCase (str) {
  return str.replace(/([A-Z])/g, ($1) => "_"+$1.toLowerCase())
}
