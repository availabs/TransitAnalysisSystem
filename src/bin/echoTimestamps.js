#!/usr/bin/env node

/*
 * This module's purpose is to test and debug the system.
 */

const _ = require('lodash')

const GTFSConfigFactory = require('../config/gtfs/GTFSConfig/GTFSConfigFactory')
const GTFSConverterServiceFactory = require('../gtfs/converter/GTFSConverterServiceFactory')
const GTFSMessageDispatcher = require('../gtfs/dispatcher/GTFSMessageDispatcher')

const STDOUTShoutOut = require('../broadcasting/io/STDOUTShoutOut')
const GTFSrtTimstampCrier = require('../broadcasting/gtfs/GTFSrtTimstampCrier')


const argv = _.omit(require('minimist')(process.argv.slice(2)), '_')

const usageMessage = `USAGE:

  * the feedName argument is required. Specify it as follows:

      --feedName=<feed name>.

  * the gtfsrt.source argument is required. It specifies the source of the GTFSrt messages.

      --gtfsrt.source=MONGO|LIVE|FILE

  * example:

     ./bin/updateGTFSData.js --feedName=mta_subway --gtfsrt.source=MONGO
`
const gtfsOptions = _.merge({
  gtfs: {
    source: 'FILE',
  },
  gtfsrt: {
  // filterConditions: {
    // startTimestamp: moment(startTime).unix(),
    // endTimestamp: moment(endTime).unix(),
    // // routeIds: [4],
  // }
  },
}, argv)


if (!(gtfsOptions.feedName && gtfsOptions.gtfsrt.source)) {
  console.error(usageMessage)
  process.exit(1)
}

if (gtfsOptions.gtfsrt.source.toUpperCase() === 'MONGO') {
  gtfsOptions.userLevel = 'READ_ONLY'
}

const stdoutShoutOut = new STDOUTShoutOut()
const gtfsrtTimstampCrier = new GTFSrtTimstampCrier()

gtfsrtTimstampCrier.registerListener(stdoutShoutOut)


const gtfsConfig = GTFSConfigFactory.build(gtfsOptions)

GTFSConverterServiceFactory.build(gtfsConfig)
  .then(
    (gtfsConverterService) => new GTFSMessageDispatcher({ gtfsConverterService })
  )
  .then(
    (gtfsMessageDispatcher) => {
      gtfsMessageDispatcher.registerListener(gtfsrtTimstampCrier)
      return gtfsMessageDispatcher.run()
    }
  )
  .then(() => console.log('echoTimestamps done'))
  .catch((err) => console.error(err))
