'use strict'


const path = require('path')

const { mta: mtaKey } = require('../../secrets').feedKeys

const { gtfsDataDir } = require('../gtfsStatic/GTFSFeedConfigImpls/GTFSFeedConfigDefaults')

const parentFeedName = 'mta_subway'

const dataDirPath = path.join(gtfsDataDir, parentFeedName)


const config = {
  gtfs: {
    feedURL: "http://transitfeeds.com/p/mta/79/latest/download",
    tripKeyMutator: [".{9}", ""],
    dataDirPath,
  },

  gtfsrt: {
    feedURL: `http://datamine.mta.info/mta_esi.php?&key=${mtaKey}&feed_id=11`,
    readInterval: 30,
    retryInterval: 4,
    maxNumRetries: 2,
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
