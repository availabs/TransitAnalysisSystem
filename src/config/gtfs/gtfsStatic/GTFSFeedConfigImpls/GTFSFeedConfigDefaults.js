// TODO: How to handle the gtfsConfigFilePath
//       The simplest thing would probably be to write it to the work dir.

'use strict'


const path = require('path')

const gtfsDataDir = path.join(__dirname, '../../../../../data/gtfs/')

const logsDir = path.join(__dirname, '../../../../../logs/')


class GTFSConfigDefaults {
  constructor (options = {}) {
    const { feedName } = options

    this.dataDirPath = path.join(gtfsDataDir, feedName)

    // Originally this was in the workDir. However, we want to stop deleting it.
    //    TODO: Make sure this works.
    this.feedDataZipFileName = 'gtfs.zip'

    this.logIndexingStatistics = false

    this.indexingStatisticsLogPath = path.join(logsDir, feedName, 'spatialDataIndexingStatistics.txt')

    this.indexStopTimes = true

    this.uploaderMaxOldSpace = 5000
  }

  static get gtfsDataDir () {
    return gtfsDataDir
  }

  static get logsDir () {
    return logsDir
  }
}

module.exports = GTFSConfigDefaults
