'use strict'

const _ = require('lodash')
const moment = require('moment')

const dateFormat = 'YYYYMMDD'

const AT_STOP_THRESHOLD_SECS = 5

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


class MareyScheduleDataExtractor {
  constructor (config = {}) {
    const that = {
      curDate: null,
      curSched: null,
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

  if (!gtfsrtJSON) {
    return
  }

  const siriJSON = converter.getCompleteVehicleMonitoringResponse()

  const timestamp = GTFSrt.getTimestampForFeedMessage()
  const momentTs = moment(timestamp * 1000)

  const date = momentTs.format(dateFormat)

  // On new day, send the listeners the previous day's schedule
  if (date !== this.curDate) {
    if (this.curSched) {
      await Promise.all(
        this.listeners.map(
          (listener) => listener.receiveMessage({ date, mareySchedData: this.curSched })
        )
      )
    }

    this.curDate = date
    this.curSched = {}
  }

  const gtfsKey2gtfsrtKeyTable =
    Object.keys(GTFSrt.tripsIndex).reduce(
      (acc, gtfsrtKey) => {
        acc[GTFSrt.getGTFSTripKeyForRealtimeTripKey(gtfsrtKey)] = gtfsrtKey
        return acc
      }, {})

  const vehicleActivity = _.get(siriJSON, vehicleActivityPath, [])

  vehicleActivity.forEach((vehAct) => {
    let siriKey = _.get(vehAct, siriKeyPath, null)

    // FIXME: Subway specific code. Find methods in the Wrappers.
    const gtfsKey = converterUpdate.datedVehicleJourneyRef_to_gtfsTripKeyTable[siriKey]
    const gtfsrtKey = gtfsKey2gtfsrtKeyTable[gtfsKey]

    // Init the data object for the trip
    const tripData = this.curSched[gtfsrtKey] = (this.curSched[gtfsrtKey] || {})

    tripData.gtfsKey = gtfsKey

    tripData.startTime = tripData.startTime || timestamp

    //FIXME: At day change, this is not accurate.
    tripData.endTime = timestamp

    tripData.routeId = tripData.routeId
      || GTFS.getRouteIDForTrip(gtfsKey)
      || (vehAct.MonitoredVehicleJourney && vehAct.MonitoredVehicleJourney.PublishedLineName)
      || GTFSrt.getRouteIDForTrip(gtfsrtKey)

    if (tripData.stopSched === undefined) {
      const schedStopTimes = _.get(GTFS, ['indexedScheduleData','stop_times', gtfsKey, 'stopInfoBySequenceNumber'], null)

      tripData.stopSched = schedStopTimes &&
          schedStopTimes.filter(s => s)
            .reduce((acc,s) => {
              acc[s.stop_id] = s.arrival_time
              return acc
            }, {})
    }

    const stops = GTFSrt.tripsIndex[gtfsrtKey].stops
    const stopsOrder = Object.keys(stops).sort((a,b) => stops[a] - stops[b])

    tripData.stopOrder = sequenceMerge(tripData.stopOrder, stopsOrder)

    // FIXME: Use a Map so we can iterate in order. 
    tripData.tripStops = tripData.tripStops || {}

    const stopId = GTFSrt.getIDOfNextOnwardStopForTrip(gtfsrtKey)

    const eta = GTFSrt.getExpectedArrivalTimeAtStopForTrip(gtfsrtKey, stopId)

    const positionTimestamp = GTFSrt.getVehiclePositionTimestamp(gtfsrtKey)
      || timestamp

    const atStop = ((eta - positionTimestamp) <= AT_STOP_THRESHOLD_SECS)

    tripData.tripStops[stopId] = { [atStop ? 'ata' : 'eta']: atStop ? positionTimestamp : eta }
  })
}


async function _teardown () {
  if (this.curSched) {
    const msg = { date: this.curDate, mareySchedData: this.curSched }
    await Promise.all(
      this.listeners.map(
        (listener) => listener.receiveMessage(msg)
      )
    )
  }

  this.listeners = null
}


/* NOTE: This may not be applicable. E.G.: Case of dropped stops.

x = [1,3,5,7,9]
y = [2,3,4,5,6,7,9,10]

sequenceMerge(x,y) // [1,2,3,4,5,6,7,8,9,10]

------

x = [1,2]
y = [3]

sequenceMerge(x,y) // [1,2,3]

*/

function sequenceMerge (arrA, arrB) {
  if (!((arrA && arrA.length) || (arrB && arrB.length))) {
    return null
  }
  if ((arrA && arrA.length) && !(arrB && arrB.length)) {
    return arrA
  }

  if ((arrB && arrB.length) && !(arrA && arrA.length)) {
    return arrB
  }

  let arrC = []

  const aLen = arrA.length
  const bLen = arrB.length

  let a = 0
  let b = 0

  while ((a < aLen) || (b < bLen)) {
    if (arrA[a] === arrB[b]) {
      arrC.push(arrA[a++])
      b++
      continue
    } else if (a >= aLen) {
      arrC = arrC.concat(arrB.slice(b))
      break
    } else if (b >= bLen) {
      arrC = arrC.concat(arrA.slice(a))
      break
    }

    const eA = arrA[a]
    const eB = arrB[b]

    const iA = arrB.indexOf(eA, b)
    const iB = arrA.indexOf(eB, a)

    if (iA > b) {
      arrC = arrC.concat(arrB.slice(b, iA+1) )
      a++
      b = iA+1
    } else if (iB > a) {
      arrC = arrC.concat(arrA.slice(a, iB+1))
      b++
      a = iB+1
    } else {
      arrC.push(arrA[a++])
    }
  }

  return arrC
}


module.exports = MareyScheduleDataExtractor
