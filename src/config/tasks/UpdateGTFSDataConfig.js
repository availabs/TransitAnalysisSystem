'use strict'


const GTFSConfig = require('../gtfs/GTFSConfig')


class UpdateGTFSDataConfig extends GTFSConfig {
  constructor (feedName) {
    super(feedName)
  }
}


module.exports = UpdateGTFSDataConfig
