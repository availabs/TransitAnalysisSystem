'use strict'

const path = require('path')

const dataDirPath = path.join(__dirname, '../nyt/data/2017-06-15/')

const ConverterService = require(path.join(__dirname, '/MockConverterService'))

const fileUploader = require('./ProtoBufFileUploader')


const MockGTFSrtFeed = require(path.join(__dirname, '/MockGTFS-Realtime_Feed.FileSystem'))

const mockGTFSrtFeed = new MockGTFSrtFeed(dataDirPath)


ConverterService.registerListener(fileUploader)

ConverterService.start(mockGTFSrtFeed)



'use strict'

process.on('uncaughtException', (err) => {
  console.error(err)
})


const MockConverterServiceFactory = require('./MockConverterServiceFactory')

// const nytArrivals = require('./NYT_ArrivalTimes.js')

const mongoConfig = require('./config/mongodb.config.js')
const { buildQueries } = require('./utils/SimpleMongoQueryBuilder')

const queryFilters = buildQueries({
  // startTimestamp:  1497514043 ,
  // endTimestamp: 1497585566,
  // resultsLimit: 2
})

const config = {
  gtfsrt: {
    queryFilters,
    mongoConfig,
  }
}

console.log('Starting analysis using the following MongoDB configuration:')
console.log(JSON.stringify(mongoConfig, null, 4))

let converterService

MockConverterServiceFactory.build(config)
  .catch((err) => { console.error(err) })
  .then((_converterService) => (converterService = _converterService))
  .catch((err) => { console.error(err) })
  .then(() => converterService.open())
  .catch((err) => { console.error(err) })
  .then(runReports)
  .catch((err) => { console.error(err) })

async function runReports () {

  while (true) {
    console.log('asdlkasdlkhasdl')
    const data = await converterService.next()
    if (data === null) {
      break
    }

    const {
      gtfsrtJSON,
      siriObj,
      converterUpdate
    } = data

    console.log(parseInt(gtfsrtJSON.header.timestamp.low))
    // await nytArrivals.feedListener(gtfsrtJSON, siriObj, converterUpdate)
  }

  converterService.close()
    .then(() => console.log('done'))
    .catch((e) => console.error(e))
}

