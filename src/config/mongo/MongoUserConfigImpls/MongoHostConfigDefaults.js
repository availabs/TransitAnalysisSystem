'use strict'


class MongoHostConfigDefaults {
  constructor () {
    this.host = 'localhost'
    this.port = 27017
    this.adminDbName = 'admin'

    // By default these are kept consistant across feeds ease of communication.
    this.gtfsrtCollectionName = 'gtfsrt'
    this.trainTrackerCollectionName = 'trainTracker'
    this.derivedDataCollectionName = 'derivedData'

    this.dotPlaceholder = '\u0466'
  }
}


module.exports = MongoHostConfigDefaults

