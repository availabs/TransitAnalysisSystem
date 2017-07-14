'use strict'


const { mta: mtaKey } = require('../../secrets').feedKeys


const config = {
  gtfs: {
    feedURL: "http://transitfeeds.com/p/mta/79/latest/download",
    tripKeyMutator: [".{9}", ""],
    indexStopTimes: true,
  },

  gtfsrt: {
    feedURL: `http://datamine.mta.info/mta_esi.php?&key=${mtaKey}`,
    readInterval: 30,
    retryInterval: 2,
    maxNumRetries: 10,
    protofileName: "nyct-subway.proto",
    useLastStoptimeUpdateAsDestination: true
  },

  converter: {
    fieldMutators: {
      OriginRef: [".", "MTA_$&"],
      DestinationRef: [".", "MTA_$&"],
      StopPointRef: [".", "MTA_$&"]
    },
    callDistanceAlongRouteNumOfDigits: 2
  }
}


module.exports = Object.freeze(config)
