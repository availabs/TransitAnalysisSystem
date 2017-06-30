'use strict'

const tripIdPaths = [
  'state.entity.trip_update.trip.trip_id',
  'state.entity.vehicle.trip.trip_id'
]

const routeIdPath = 'state.entity.trip_update.trip.route_id'


function buildQueries (params) {

  let {
    startTimestamp,
    endTimestamp,
    tripIds,
    routeIds
  } = params


  if ((startTimestamp && isNaN(startTimestamp)) ||
      (endTimestamp && isNaN(endTimestamp))) {
    throw ('Timestamps must be a UNIX timestamp.')
  }

  if (tripIds && !Array.isArray(tripIds)) {
    tripIds = [tripIds]
  }

  if (routeIds && !Array.isArray(routeIds)) {
    routeIds = [routeIds]
  }


  const trainTrackerConditions = []

  if (startTimestamp) {
    trainTrackerConditions.push({ _id: { $gte : startTimestamp } })
  }

  if (endTimestamp) {
    trainTrackerConditions.push({ _id: { $gte : endTimestamp } })
  }

  const gtfsrtConditions = trainTrackerConditions.slice()

  if (tripIds) {
    gtfsrtConditions.push({
      $or: tripIdPaths.map(p => ({ [p]: { $in: tripIds } }))
    })
  }

  if (routeIds) {
    gtfsrtConditions.push({
      [routeIdPath]: { $in: routeIds }
    })
  }

  let trainTrackerQueryObject
  let gtfsrtQueryObj

  if (trainTrackerConditions.length > 1) {
    // More than one condition, link with AND
    trainTrackerQueryObject = { $and: trainTrackerConditions }
  } else {
    // Either a single condition or none.
    trainTrackerQueryObject = trainTrackerConditions[0] || null
  }

  if (gtfsrtConditions.length > 1) {
    // More than one condition, link with AND
    gtfsrtQueryObj = { $and: gtfsrtConditions }
  } else {
    // Either a single condition or none.
    gtfsrtQueryObj = gtfsrtConditions[0] || null
  }

  return {
    trainTrackerQueryObject,
    gtfsrtQueryObj
  }
}


module.exports = {
  buildQueries
}
