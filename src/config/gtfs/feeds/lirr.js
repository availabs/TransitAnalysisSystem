'use strict'


const { mta: mtaKey } = require('../../secrets').feedKeys


const config = {
  gtfs: {
    feedURL: "http://transitfeeds.com/p/mta/86/latest/download",
    indexStopTimes: true,
  },

  gtfsrt: {
    feedURL: `http://mnorth.prod.acquia-sites.com/wse/LIRR/gtfsrt/realtime/${mtaKey}/proto`,
    readInterval: 60,
    retryInterval: 5,
    maxNumRetries: 4,
    protofileName: "nyct-subway.proto",
    useLastStoptimeUpdateAsDestination: false
  },

  converter: {
    fieldMutators: {
      OriginRef: [".", "AMTRAK_$&"],
      DestinationRef: [".", "AMTRAK_$&"],
      StopPointRef: [".", "AMTRAK_$&"]
    },
  }
}


module.exports = Object.freeze(config)
