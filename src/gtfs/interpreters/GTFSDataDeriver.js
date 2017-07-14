'use strict'

const _ = require('lodash')
const moment = require('moment')

const vehicleActivityPath = [
  'Siri',
  'ServiceDelivery',
  'VehicleMonitoringDelivery',
  'VehicleActivity',
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

// TODO: Actors need to take take sub-actors
// TODO: Actors need to be able to communicate with actors
class GTFSDDataDeriver {
  constructor (config = {}) {
    const that = {

      listeners: config.listeners || []
    }

    this.registerListener = _registerListener.bind(that)
    this.receiveMessage = _receiveMessage.bind(that)
    this.teardown = _teardown.bind(that)
  }
}


function _registerListener (listener) {
  this.listeners.push(listener)
}

async function _receiveMessage (converterUpdate) {

  const {
    GTFS,
    GTFSrt,
    converter,
  } = converterUpdate

  // TODO: get rid of these and use the getters on the wrapperObjects
  const gtfsrtJSON = GTFSrt.GTFSrt_JSON

  const siriJSON = converter.getCompleteVehicleMonitoringResponse()

  const timestamp = GTFSrt.getTimestampForFeedMessage()

  if (!gtfsrtJSON) {
    return
  }

  // Initialize the stop_id -> stop_coords table
  if (!this.stopCoords) {
    this.stopCoords = {}
    GTFS.indexedSpatialData.stopProjectionsTable.forEach((stopProjs) => {
      Object.keys(stopProjs).forEach(s => {
        if (!stopProjs[s].stop_coords) {
          return
        }
        this.stopCoords[s] = (this.stopCoords[s] || stopProjs[s].stop_coords)
      })
    })
  }

  const vehicleActivity = _.get(siriJSON, vehicleActivityPath, null)

  const derivedData = _.reduce(vehicleActivity, (acc, vehAct) => {
    let siriKey = _.get(vehAct, siriKeyPath, null)

    // FIXME: Subway specific code. Find methods in the Wrappers.
    const gtfsKey = converterUpdate.datedVehicleJourneyRef_to_gtfsTripKeyTable[siriKey]
    const gtfsrtKey = siriKey.split('_').slice(-2).join('_')

    const trainLocationEntry = _.get(converter, getTrainLocationEntryPath(gtfsKey), null)

    const stopId = GTFSrt.getIDOfNextOnwardStopForTrip(gtfsrtKey)
    const eta = GTFSrt.getExpectedArrivalTimeAtStopForTrip(gtfsrtKey, stopId)

    const distanceFromCall = converter.trainTrackerSnapshot.getDistanceFromCall(gtfsKey, stopId)
    const positionTimestamp = GTFSrt.getVehiclePositionTimestamp(gtfsrtKey)
    const atStop = (eta <= positionTimestamp)
    const ata = (atStop) ? positionTimestamp : null
    const routeId = GTFS.getRouteIDForTrip(gtfsKey)
      || (vehAct.MonitoredVehicleJourney && vehAct.MonitoredVehicleJourney.PublishedLineName)
      || GTFSrt.getRouteIDForTrip(gtfsrtKey)

    let latitude = converter.trainTrackerSnapshot.getLatitude(gtfsKey)
    let longitude = converter.trainTrackerSnapshot.getLongitude(gtfsKey)

    if (atStop && !(latitude && longitude)) {
      [longitude = null, latitude = null] = _.get(this.stopCoords, [stopId], [])
    }

    let sta = GTFS.getScheduledArrivalTimeForStopForTrip(gtfsKey, stopId)

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

      // FIXME: Breaks if train > 12h late.
      const _staPreviousDay = (_timestampHour < _staHour)
        && ((_timestampHour + (24 -_staHour)) < (_staHour - _timestampHour))

      if (_staPreviousDay) {
        _sta.subtract(1, 'day')
      }

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


  await Promise.all(
    this.listeners.map(
      (listener) => listener.receiveMessage({ timestamp, derivedData })
    )
  )
}

async function _teardown () {
  this.listeners = null
}

function getTrainLocationEntryPath (gtfsKey) {
  return [
    'trainTrackerSnapshot',
    'trainLocations',
    gtfsKey
  ]
}


module.exports = GTFSDDataDeriver
