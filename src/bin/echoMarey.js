#!/usr/bin/env node

/*
 * This module's purpose is to test and debug the system.
 */

const _ = require('lodash')
const moment = require('moment')

const outFilePath = '/tmp/marey.json'

const GTFSConfigFactory = require('../config/gtfs/GTFSConfig/GTFSConfigFactory')
const GTFSConverterServiceFactory = require('../gtfs/converter/GTFSConverterServiceFactory')
const GTFSMessageDispatcher = require('../gtfs/dispatcher/GTFSMessageDispatcher')

const FSScribe = require('../broadcasting/io/FSScribe')
const MareySchedDataExtractor = require('../gtfs/interpreters/MareySchedDataExtractor')


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
    filterConditions: {
      startTimestamp: moment('2017-08-05 00:00:00').unix(),
      endTimestamp: moment('2017-08-08 00:00:01').unix(),
    }
  },
}, argv)


if (!(gtfsOptions.feedName && gtfsOptions.gtfsrt.source)) {
  console.error(usageMessage)
  process.exit(1)
}

if (gtfsOptions.gtfsrt.source.toUpperCase() === 'MONGO') {
  gtfsOptions.userLevel = 'READ_ONLY'
}

const fsScribe = new FSScribe({ path: outFilePath })
const mareySchedDataExtractor = new MareySchedDataExtractor()

mareySchedDataExtractor.registerListener(fsScribe)


const gtfsConfig = GTFSConfigFactory.build(gtfsOptions)

GTFSConverterServiceFactory.build(gtfsConfig)
  .then(
    (gtfsConverterService) => new GTFSMessageDispatcher({ gtfsConverterService })
  )
  .then(
    (gtfsMessageDispatcher) => {
      gtfsMessageDispatcher.registerListener(mareySchedDataExtractor)
      return gtfsMessageDispatcher.run()
    }
  )
  .then(() => console.log('echoTimestamps done'))
  .catch((err) => console.error(err))
