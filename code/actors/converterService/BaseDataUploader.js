'use strict'


const MongoClient = require('mongodb').MongoClient
const _ = require('lodash')
const moment = require('moment')

const MongoKeyHandler = require('../../utils/MongoKeyHandler')

const vehicleActivityPath = [
  'Siri',
  'ServiceDelivery',
  'VehicleMonitoringDelivery',
  0,
  'VehicleActivity'
]

const siriKeyPath = [
  'MonitoredVehicleJourney',
  'FramedVehicleJourneyRef',
  'DatedVehicleJourneyRef',
]

const distTraveledPath = [
  'locationGeoJSON',
  'properties',
  'start_dist_along_route_in_km',
]


class BaseDataUploader {

  constructor (config) {
    this.config = config
    this.mongoKeyHandler = new MongoKeyHandler(config.dotPlaceholder)

    this.lastTimestamp = Number.NEGATIVE_INFINITY

    this.db = null
    this.baseDataCollection = null
  }

  async receiveMessage (gtfsrtJSON, siriJSON, converterCache) {

    if (!gtfsrtJSON) {
      return
    }

    const timestamp = +gtfsrtJSON.header.timestamp.low

    // CONSIDER: Should we require sorted order of messages ???
    if (timestamp <= this.lastTimestamp) {
      return
    }

    this.lastTimestamp = timestamp

    if (!this.db) {
      await _connectToMongo.call(this)
    }

    if (!gtfsrtJSON) {
      return
    }

    // Initialize the stop_id -> stop_coords table
    if (!this.stopCoords) {
      this.stopCoords = {}
      converterCache.GTFS.indexedSpatialData.stopProjectionsTable.forEach((stopProjs) => {
        Object.keys(stopProjs).forEach(s => {
          if (!stopProjs[s].stop_coords) {
            return
          }
          this.stopCoords[s] = (this.stopCoords[s] || stopProjs[s].stop_coords)
        })
      })
    }

    const vehicleActivity = _.get(siriJSON, vehicleActivityPath, null)

    const messageData = _.reduce(vehicleActivity, (acc, vehAct) => {
      let siriKey = _.get(vehAct, siriKeyPath, null)

      const gtfsKey = siriKey.substring(18)
      const gtfsrtKey = siriKey.split('_').slice(-2).join('_')

      const trainLocationEntry = _.get(converterCache, getTrainLocationEntryPath(gtfsKey), null)

      const stopId = converterCache.GTFSrt.getIDOfNextOnwardStopForTrip(gtfsrtKey)
      const eta = converterCache.GTFSrt.getExpectedArrivalTimeAtStopForTrip(gtfsrtKey, stopId)

      const distanceFromCall = converterCache.converter.trainTrackerSnapshot.getDistanceFromCall(gtfsKey, stopId)
      const positionTimestamp = converterCache.GTFSrt.getVehiclePositionTimestamp(gtfsrtKey)
      const atStop = (eta <= positionTimestamp)
      let sta = converterCache.GTFS.getScheduledArrivalTimeForStopForTrip(gtfsKey, stopId)
      const ata = (atStop) ? positionTimestamp : null
      const routeId = converterCache.GTFS.getRouteIDForTrip(gtfsKey)

      let latitude = converterCache.converter.trainTrackerSnapshot.getLatitude(gtfsKey)
      let longitude = converterCache.converter.trainTrackerSnapshot.getLongitude(gtfsKey)

      if (atStop && !(latitude && longitude)) {
        [longitude = null, latitude = null] = _.get(this.stopCoords, [routeId], [])
      }

      if (sta) {
        const _timestamp = moment(timestamp * 1000)
        const _timestampHour = parseInt(_timestamp.hour())

        const _staHour = parseInt(sta.slice(0,2)) % 24
        const _staMinute = parseInt(sta.slice(3,5))
        const _staSecond = parseInt(sta.slice(6))

        const _sta = moment(_timestamp)
        _sta.hour(_staHour)
        _sta.minute(_staMinute)
        _sta.second(_staSecond)

        // FIXME: Breaks if train > 12h late
        const _staPreviousDay = (_timestampHour < _staHour)
          && ((_timestampHour + (24 -_staHour)) < (_staHour - _timestampHour))

        // console.log('ts: ', _timestamp)
        // console.log('eta:', eta && moment(eta * 1000))
        if (_staPreviousDay) {
          // console.log('_staPreviousDay === true')
          _sta.subtract(1, 'day')
        }

        // console.log('sta:', _sta, '   from', sta)
        sta = (_sta.valueOf() / 1000)
      }

      acc[gtfsrtKey] = {
        gtfsKey,
        gtfsrtKey,

        gtfsrtMsgTimestamp: timestamp,
        positionTimestamp,

        latitude,
        longitude,

        sta,
        eta,
        ata,
        routeId,
        stopId,
        atStop,
        distanceFromCall,
        distTraveled : _.get(trainLocationEntry, distTraveledPath, null),
      }

      return acc
    }, {})

    const id = { _id: timestamp }
    const doc = { state: this.mongoKeyHandler.cleanKeys(messageData) }

    await this.baseDataCollection.update(id, doc, { upsert: true})

    return
  }

  async teardown () {
    console.log('TEARDOWN BaseDataUploader')
    this.lastTimestamp = Number.NEGATIVE_INFINITY

    this.baseDataCollection = null

    await this.db.close()
    this.db = null
    this.stopCoords = null
  }
}

function getTrainLocationEntryPath (gtfsKey) {
  return [
    'converter',
    'trainTrackerSnapshot',
    'trainLocations',
    gtfsKey
  ]
}

async function _connectToMongo () {
  this.db = await MongoClient.connect(this.config.mongoURL)
  this.baseDataCollection = this.db.collection(this.config.baseDataCollectionName)
}


module.exports = BaseDataUploader



// NOTES:
//
// lib/trainTracking/Utils.js
// 12:            atStop                     : null ,
// 32:    stopInfo.atStop = (stopInfo.eta !== null) ? (stopInfo.eta <= stopInfo.timestamp) : null ;
// 48:    //if (!stopInfo.atStop) { // Seems like safe assumptions...
// 49:    if (stopInfo.atStop === null) { // Seems like safe assumptions...
// 54:            stopInfo.atStop = true;

// 22     getSnappedCoordinatesOfStopForTrip : function (tripKey, stop_id) {
// 21         var i = _.get(this, ['indexedSpatialData', 'tripKeyToProjectionsTableIndex', tripKey], null);
// 20
// 19         return _.get(this, ['indexedSpatialData', 'stopProjectionsTable', i, stop_id, 'snapped_coords'], null);
// 18     },
// if (!(latitude && longitude) && atStop) {
// }
// {
  // "stopProjectionsTable": [
    // {
      // "__originStopID": "701S",
      // "__destinationStopID": "726S",
      // "__shapeID": "7..S97R",
      // "701S": {
        // "segmentNum": 0,
        // "stop_id": "701S",
        // "stop_coords": [
          // -73.83003,
          // 40.7596
        // ],
        // "snapped_coords": [
          // -73.83003,
          // 40.7596
        // ],
        // "snapped_dist_along_km": 0,
        // "deviation": 0,
        // "previous_stop_id": null
      // },
