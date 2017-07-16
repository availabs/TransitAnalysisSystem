#!/usr/bin/env node

const _ = require('lodash')

// const moment = require('moment')

const GTFSConfigFactory = require('../config/gtfs/GTFSConfig/GTFSConfigFactory')
const MongoUserConfigFactory = require('../config/mongo/MongoUserConfigFactory')

const GTFSConverterServiceFactory = require('../gtfs/converter/GTFSConverterServiceFactory')
const GTFSMessageDispatcher = require('../gtfs/dispatcher/GTFSMessageDispatcher')

const GTFSDataDeriver = require('../gtfs/interpreters/GTFSDataDeriver')
const GTFSDerivedDataUploaderFactory =
    require('../storage/mongo/gtfs/uploaders/GTFSDerivedDataUploaderFactory')


const argv = _.omit(require('minimist')(process.argv.slice(2)), '_')

const usageMessage = `USAGE:

  * the feedName argument is required. Specify it as follows:

      --feedName=<feed name>.

  * the gtfsrt.source argument is required. It specifies the source of the GTFSrt messages.

      --gtfsrt.source=MONGO|LIVE|FILE

  * example:

     ./bin/updateGTFSData.js --feedName=mta_subway --gtfsrt.source=MONGO
`

// const startTime = '2017-06-15 12:00:00'
// const endTime = '2017-06-15 14:00:00'


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


const gtfsConfig = GTFSConfigFactory.build(gtfsOptions)
const mongoReadWriteUserConfig =
    MongoUserConfigFactory.build({
      feedName: gtfsOptions.feedName,
      userLevel: 'READ_WRITE'
    })

const gtfsDataDeriver = new GTFSDataDeriver()


let gtfsConverterService
let derivedDataUploader
let gtfsMessageDispatcher

Promise.all([
  GTFSConverterServiceFactory.build(gtfsConfig),
  GTFSDerivedDataUploaderFactory.build(mongoReadWriteUserConfig)
])
  .then(
    ([ _gtfsConverterService, _derivedDataUploader ]) => {

      // put these in the file scope for later use
      gtfsConverterService = _gtfsConverterService
      derivedDataUploader = _derivedDataUploader

      gtfsMessageDispatcher = new GTFSMessageDispatcher({ gtfsConverterService })

      gtfsMessageDispatcher.registerListener(gtfsDataDeriver)
      gtfsDataDeriver.registerListener(derivedDataUploader)
    }
  )
  .then(
    async () => gtfsMessageDispatcher.run()
  )
  .then(
    async () => Promise.all([
      derivedDataUploader.teardown(),
      gtfsDataDeriver.teardown(),
      gtfsMessageDispatcher.teardown(),
      gtfsConverterService.close(),
    ])
  )
  .then(() => console.log('done'))
  .catch((err) => console.error(err))

