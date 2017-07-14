#!/usr/bin/env node

/*
 * This module's purpose is to test and debug the system.
 */


const GTFSConfigFactory = require('../config/gtfs/GTFSConfig/GTFSConfigFactory')
const GTFSConverterServiceFactory = require('../gtfs/converter/GTFSConverterServiceFactory')
const GTFSMessageDispatcher = require('../gtfs/dispatcher/GTFSMessageDispatcher')

const STDOUTShoutOut = require('../broadcasting/io/STDOUTShoutOut')
const GTFSrtTimstampCrier = require('../broadcasting/gtfs/GTFSrtTimstampCrier')


const argv = require('minimist')(process.argv.slice(2))

const { feedName, gtfsrtSource } = argv

const usageMessage = `USAGE:

  * the feedName argument is required. Specify it as follows:

      --feedName=<feed name>.

  * the gtfsrtSource argument is required. It specifies the source of the GTFSrt messages.

      --gtfsrtSource=MONGO|LIVE|FILE

  * example:

     ./bin/updateGTFSData.js --feedName=mta_subway --gtfsrtSource=MONGO
`
if (!(feedName && gtfsrtSource)) {
  console.error(usageMessage)
  process.exit(1)
}

const gtfsOptions = {
  feedName,
  gtfs: {
    source: 'FILE',
  },
  gtfsrt: {
    source: gtfsrtSource
  }
}

if (gtfsrtSource.toUpperCase() === 'MONGO') {
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
