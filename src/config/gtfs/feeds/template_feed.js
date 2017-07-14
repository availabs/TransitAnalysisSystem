/*
 * Configuration parameters specified within a feed configuration object
 *   override the conventions for the system components.
 */


'use strict'

const config = {

  gtfs: {
    feedURL: "<The URL of the GTFS static data server.>",
  },

  gtfsrt: {
    feedURL: "<URL of the GTFS-Realtime Protocol Buffer feed. Include the key, if necessary.",
  },

  converter: {
    fieldMutators: {
      OriginRef: ["", ""],
      DestinationRef: ["", ""],
      StopPointRef: ["", ""]
    },
    callDistanceAlongRouteNumOfDigits: 4
  },

  logging: {},

  mongo: {}

}

module.export = Object.freeze(config)
