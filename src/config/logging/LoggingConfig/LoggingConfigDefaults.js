'use strict'


const path = require('path')

const logsDir = path.join('../../../../logs/')

const mkdirp = require('mkdirp')

mkdirp.sync(logsDir)


class LoggingConfigDefaults {
  constructor (feedName) {
    // Flags
    this.logDataAnomalies = false
    this.logErrors = false
    this.logTrainLocations = false
    this.logTrainTrackingStats = false
    this.logUnscheduledTrips = false
    this.logNoSpatialDataTrips = false
    this.logTrainTrackingErrors = false

    // Paths
    this.dataAnomaliesLogPath = path.join(logsDir, `${feedName}_dataAnomalies.log`)
    this.errorsLogPath = path.join(logsDir, `${feedName}_errors.log`)
    this.trainLocationsLogPath = path.join(logsDir, `${feedName}_trainLocations.log`)
    this.trainTrackingStatsLogPath = path.join(logsDir, `${feedName}_trainTrackingStats.log`)
    this.unscheduledTripsLogPath = path.join(logsDir, `${feedName}_unscheduledTrips.log`)
    this.noSpatialDataTripsLogPath = path.join(logsDir, `${feedName}_noSpatialDataTrips.log`)
    this.trainTrackingErrorsLogPath = path.join(logsDir, `${feedName}_trainTrackingErrors.log`)
  }
}

module.exports = LoggingConfigDefaults
