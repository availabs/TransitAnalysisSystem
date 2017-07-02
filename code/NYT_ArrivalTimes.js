/* eslint dot-notation: "off", no-lonely-if: "off" */
'use strict'

const process = require('process')
const ss = require('simple-statistics')
const _ = require('lodash')

let chain = {}

let recordedAtTimes = {}

const pathToDistances = [
  'MonitoredVehicleJourney',
  'MonitoredCall',
  'Extensions',
  'Distances',
]

const pathToValidUntil = [
  'Siri',
  'ServiceDelivery',
  'VehicleMonitoringDelivery',
  0,
  'ValidUntil',
]

const pathToVehicleActivity = [
  'Siri',
  'ServiceDelivery',
  'VehicleMonitoringDelivery',
  0,
  'VehicleActivity'
]

async function feedListener (gtfsrtJSON, siriJSON, converterUpdate) {

  const gtfsWrapper = converterUpdate.GTFS

  let respDateObj = new Date(validUntilTimestamp)
  let validUntilTimestamp = _.get(siriJSON, pathToValidUntil, null)

  respDateObj.setSeconds(respDateObj.getSeconds() - 30)
  respDateObj.setHours(respDateObj.getHours() + 4)

  let dayOfWeek = respDateObj.getDay()
  let hour      = respDateObj.getHours()

  let timeBin

  if (dayOfWeek % 6) {
    if ((hour >=6) && (hour < 10)) {
      timeBin = 'wdy_am'
    } else if ((hour >= 10) && (hour < 16)) {
      timeBin = 'wdy_midday'
    } else if ((hour >= 16) && (hour < 20)) {
      timeBin = 'wdy_pm'
    } else {
      timeBin = 'wdy_offpeak'
    }
  } else {
    if ((hour >=6) && (hour < 20)) {
      timeBin = 'wnd_peak'
    } else {
      timeBin = 'wnd_offpeak'
    }
  }

  let newChain = {}
  const vehicleActivity = _.get(siriJSON, pathToVehicleActivity, [])

  vehicleActivity.forEach((vehAct) => {
    let vehicleRef = vehAct.MonitoredVehicleJourney.VehicleRef

    let recordedAtTime = vehAct.RecordedAtTime // GTFSrt.getVehiclePositionTimestamp(trip_id)

    // test that this is the case... use an assertion
    if (recordedAtTime === recordedAtTimes[vehicleRef]) {
      return
    }

    const {
      DistanceFromCall: distanceFromCall,
      CallDistanceAlongRoute: callDistanceAlongRoute,
    }  = _.get(vehicleRef, pathToDistances, {})

    let isAtStop = (+distanceFromCall === 0)

    let previousPair = chain[vehicleRef]

    let nextStop = vehAct.MonitoredVehicleJourney.MonitoredCall.StopPointRef

    let nextETA =
        new Date(vehAct.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime).getTime()

    if (previousPair && (previousPair.stop === nextStop)) {
      if (!previousPair.isAtStop && isAtStop) {
        const actualArrivalTime = recordedAtTime
        // getScheduledArrivalTimeForStopForTrip : function (tripKey, stop_id, stop_sequence)
        const scheduledArrivalTime = gtfsWrapper.getScheduledArrivalTime()
      }
    } else {
      newChain[vehicleRef] = { stop: nextStop, eta: nextETA }
    }

    recordedAtTimes[vehicleRef] = recordedAtTime
  })

  chain = newChain

  return
}


module.exports = {
  feedListener
}
