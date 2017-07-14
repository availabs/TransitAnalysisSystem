#!/usr/bin/env node


const GTFSConfigFactory = require('../config/gtfs/GTFSConfig/GTFSConfigFactory')
const MongoUserConfigFactory = require('../config/mongo/MongoUserConfigFactory')

const GTFSConverterServiceFactory = require('../gtfs/converter/GTFSConverterServiceFactory')
const GTFSMessageDispatcher = require('../gtfs/dispatcher/GTFSMessageDispatcher')

const GTFSConverterUpdateSerializer = require('../gtfs/interpreters/GTFSConverterUpdateSerializer')
const SerializedGTFSConverterUpdateUploaderFactory =
    require('../storage/mongo/gtfs/uploaders/SerializedGTFSConverterUpdateUploaderFactory')

const GTFSDataDeriver = require('../gtfs/interpreters/GTFSDataDeriver')
const GTFSDerivedDataUploaderFactory =
    require('../storage/mongo/gtfs/uploaders/GTFSDerivedDataUploaderFactory')



const argv = require('minimist')(process.argv.slice(2))

const { feedName, gtfsrtSource, dataDirectory } = argv

const usageMessage = `USAGE:

  * the feedName argument is required. Specify it as follows:

      --feedName=<feed name>.

  * the gtfsrtSource argument is required. It specifies the source of the GTFSrt messages.

      --gtfsrtSource=MONGO|LIVE|FILE

  * if using gtfsrtSource=FILE, you can provide the --dataDirectory=<directory path> argument

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
    // indexedScheduleDataFilePath: require('path').join(__dirname, '../../data/gtfs/_test_/indexedScheduleData.json')
  },
  gtfsrt: {
    source: gtfsrtSource,
    dataDirectory,
  }
}

const gtfsConfig = GTFSConfigFactory.build(gtfsOptions)
const mongoReadWriteUserConfig = MongoUserConfigFactory.build({ feedName, userLevel: 'READ_WRITE' })

const gtfsConverterUpdateSerializer = new GTFSConverterUpdateSerializer()

const gtfsDataDeriver = new GTFSDataDeriver()

let gtfsConverterService
let serializedGTFSConverterUpdateUploader
let derivedDataUploader
let gtfsMessageDispatcher

Promise.all([
  GTFSConverterServiceFactory.build(gtfsConfig),
  SerializedGTFSConverterUpdateUploaderFactory.build(mongoReadWriteUserConfig),
  GTFSDerivedDataUploaderFactory.build(mongoReadWriteUserConfig),
])
  .then(
    ([ _gtfsConverterService,
      _serializedGTFSConverterUpdateUploader,
      _derivedDataUploader,
    ]) => {

      // put these in the file scope for later use
      gtfsConverterService = _gtfsConverterService
      serializedGTFSConverterUpdateUploader = _serializedGTFSConverterUpdateUploader
      derivedDataUploader = _derivedDataUploader

      gtfsMessageDispatcher = new GTFSMessageDispatcher({ gtfsConverterService })

      gtfsMessageDispatcher.registerListener(gtfsConverterUpdateSerializer)
      gtfsMessageDispatcher.registerListener(gtfsDataDeriver)

      gtfsConverterUpdateSerializer.registerListener(serializedGTFSConverterUpdateUploader)
      gtfsDataDeriver.registerListener(derivedDataUploader)
    }
  )
  .then(
    async () => gtfsMessageDispatcher.run()
  )
  .then(
    async () => Promise.all([
      serializedGTFSConverterUpdateUploader.teardown(),
      gtfsConverterUpdateSerializer.teardown(),
      gtfsMessageDispatcher.teardown(),
      gtfsConverterService.teardown(),
    ])
  )
  .then(() => console.log('done'))
  .catch((err) => console.error(err))

