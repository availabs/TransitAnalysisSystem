'use strict'

process.on('uncaughtException', (err) => {
  console.error(err)
})

const path = require('path')
const mkdirp = require('mkdirp')

const ConverterService = require(path.join(__dirname, '/MockConverterService'))

// const locationTrackingListener = require(path.join(__dirname, '/LocationTrackingAnalysis'))
// const etaReliabiltyListener = require(path.join(__dirname, './ExpectedArrivalTimeReliabiltyAnalysis'))
const nytArrivals = require('./NYT_ArrivalTimes.js')

const MockGTFSrtFeed = require(path.join(__dirname, '/MockGTFS-Realtime_Feed.Mongo'))
const mongoConfig = require('./config/mongodb.config.js')
const { buildQueries } = require('./utils/SimpleMongoQueryBuilder')

const mockGTFSrtFeed = new MockGTFSrtFeed(mongoConfig)

const queries = buildQueries({
  startTimestamp:  1497514043 ,
  // endTimestamp: 1497585566,
  resultsLimit: 1
})

mockGTFSrtFeed.setQueryFilters(queries)

mkdirp.sync(path.join(__dirname, '../logs'))
mkdirp.sync(path.join(__dirname, '../analysis_out'))

// ConverterService.registerListener(locationTrackingListener)
// ConverterService.registerListener(etaReliabiltyListener)
ConverterService.registerListener(nytArrivals)

console.log('Starting analysis using the following MongoDB configuration:')
console.log(JSON.stringify(mongoConfig, null, 4))
console.log()

ConverterService.start(mockGTFSrtFeed)
