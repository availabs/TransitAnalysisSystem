'use strict'

const tripIdPaths = [
  'state.entity.trip_update.trip.trip_id',
  'state.entity.vehicle.trip.trip_id'
]

const routeIdPath = 'state.entity.trip_update.trip.route_id'


function buildCachedGTFSrtQueryConditions (queryConditions) {

  let {
    startTimestamp,
    endTimestamp,
    tripIds,
    routeIds,
    resultsLimit
  } = queryConditions


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
    trainTrackerConditions.push({ _id: { $lt : endTimestamp } })
  }

  // gtfsrt conditions are a superset of trainTracker conditions
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

  let trainTrackerQueryObj
  let gtfsrtQueryObj

  if (trainTrackerConditions.length > 1) {
    // More than one condition, link with AND
    trainTrackerQueryObj = { $and: trainTrackerConditions }
  } else {
    // Either a single condition or none.
    trainTrackerQueryObj = trainTrackerConditions[0] || null
  }

  if (gtfsrtConditions.length > 1) {
    // More than one condition, link with AND
    gtfsrtQueryObj = { $and: gtfsrtConditions }
  } else {
    // Either a single condition or none.
    gtfsrtQueryObj = gtfsrtConditions[0] || null
  }

  return {
    trainTrackerQueryObj,
    gtfsrtQueryObj,
    resultsLimit: Number.isFinite(+resultsLimit) ? +resultsLimit : null
  }
}


module.exports = {
  buildCachedGTFSrtQueryConditions
}
