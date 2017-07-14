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
    trainTrackerConditions.push({ _id: { $gte : endTimestamp } })
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

  let trainTrackerQuery
  let gtfsrtQuery

  if (trainTrackerConditions.length > 1) {
    // More than one condition, link with AND
    trainTrackerQuery = { $and: trainTrackerConditions }
  } else {
    // Either a single condition or none.
    trainTrackerQuery = trainTrackerConditions[0] || null
  }

  if (gtfsrtConditions.length > 1) {
    // More than one condition, link with AND
    gtfsrtQuery = { $and: gtfsrtConditions }
  } else {
    // Either a single condition or none.
    gtfsrtQuery = gtfsrtConditions[0] || null
  }

  return {
    trainTrackerQuery,
    gtfsrtQuery,
    resultsLimit: Number.isFinite(+resultsLimit) ? +resultsLimit : null
  }
}


module.exports = {
  buildCachedGTFSrtQueryConditions
}
