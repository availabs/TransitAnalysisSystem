#!/usr/bin/env node


const GTFSConfigFactory = require('../config/gtfs/GTFSConfig/GTFSConfigFactory')
const MongoUserConfigFactory = require('../config/mongo/MongoUserConfigFactory')

const GTFSConverterServiceFactory = require('../gtfs/converter/GTFSConverterServiceFactory')
const GTFSMessageDispatcher = require('../gtfs/dispatcher/GTFSMessageDispatcher')

const GTFSDataDeriver = require('../gtfs/interpreters/GTFSDataDeriver')
const GTFSDerivedDataUploaderFactory =
    require('../storage/mongo/gtfs/uploaders/GTFSDerivedDataUploaderFactory')


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


const gtfsConfig = GTFSConfigFactory.build(gtfsOptions)
const mongoReadWriteUserConfig = MongoUserConfigFactory.build({ feedName, userLevel: 'READ_WRITE' })

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
      gtfsDataDeriver.tearDown(),
      gtfsMessageDispatcher.teardown(),
      gtfsConverterService.teardown(),
    ])
  )
  .then(() => console.log('done'))
  .catch((err) => console.error(err))

