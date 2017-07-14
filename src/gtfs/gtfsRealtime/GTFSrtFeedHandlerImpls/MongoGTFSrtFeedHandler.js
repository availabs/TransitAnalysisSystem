/* 
 * TODO: This should become CursorGTFSrtFeedHandler.
 *       Decouple from MongoDB and provide it instead a Cursor interface.
 *       Should not matter whether it is a MongoDB or PostgreSQL Cursor.
 * TODO: setQueryFilters & getTrainTrackerInitialState do not belong in here.
 *       This module's sole responsibility should be iterating over a Cursor
 *       while providing the GTFSrtFeedHandler interface.
 */


'use strict'

const MongoClient = require('mongodb').MongoClient

const GTFSrtFeedHandlerInterface = require('../GTFSrtFeedHandlerInterface')

const MongoKeyHandler = require('../../../utils/MongoKeyHandler')

const { buildCachedGTFSrtQueryConditions } = require('../../../utils/SimpleMongoQueryBuilder')


class MongoGTFSrtFeedHandler extends GTFSrtFeedHandlerInterface {

  constructor (config) {
    super()

    const that = config

    that.mongoKeyHandler = new MongoKeyHandler(config.dotPlaceholder)

    if (config.filterConditions) {
      _setQueryFilters.call(that, config.filterConditions)
    }

    this.open = _open.bind(that)
    this.getTrainTrackerInitialState = _getTrainTrackerInitialState.bind(that)
    this.next = _next.bind(that)
    this.close = _close.bind(that)
  }
}

function _setQueryFilters (filterConditions) {
  const {
    gtfsrtQueryObj,
    trainTrackerQueryObject,
    resultsLimit,
  } = buildCachedGTFSrtQueryConditions(filterConditions)

  this.gtfsrtQueryObj = gtfsrtQueryObj
  this.trainTrackerQueryObject = trainTrackerQueryObject
  this.resultsLimit = +resultsLimit
}

async function _open () {
  this.db = await MongoClient.connect(this.mongoURL)
  this.gtfsrtCollection = this.db.collection(this.gtfsrtCollectionName)
  this.trainTrackerCollection = this.db.collection(this.trainTrackerCollectionName)
  this.gtfsrtCursor = this.gtfsrtCollection.find(this.gtfsrtQueryObj, { sort: { _id: 1 } })

  if (Number.isFinite(this.resultsLimit)) {
    this.gtfsrtCursor = this.gtfsrtCursor.limit(this.resultsLimit)
  }
}

async function _getTrainTrackerInitialState () {
  const sortRule = { sort: { _id: 1 } }

  const doc = await this.trainTrackerCollection.findOne(this.trainTrackerQueryObject, sortRule)

  const restoredData = this.mongoKeyHandler.restoreKeys(doc)
  return restoredData
}

async function _next () {
  if (!this.gtfsrtCursor) {
    throw new Error('No MongoDB cursor opened.')
  }

  // If item === null, all data has been sent.
  const item = await this.gtfsrtCursor.nextObject()

  const state = item && this.mongoKeyHandler.restoreKeys(item.state)
  return state
}

async function _close () {
  await this.db.close()
  this.dbf = null
  this.gtfsrtCollection = null
  this.trainTrackerCollection = null
  this.gtfsrtCursor = null
}

module.exports = MongoGTFSrtFeedHandler
