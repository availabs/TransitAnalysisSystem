'use strict'

// Used to run tests. No GTFS Realtime feed available.
const config = {
  gtfs: {
    feedURL: "https://transitfeeds.com/p/cdta/55/latest/download",
    indexStopTimes: false,
  },
}


module.exports = Object.freeze(config)
