#!/usr/bin/env node

const ConverterServiceEngine = require('../code/engines/ConverterServiceEngine')

const nytMongoConfig = require('../code/config/nyt.mongo')

const BaseDataUploader = require('../code/actors/converterService/BaseDataUploader')
const baseDataMongoConfig = require('../code/config/baseData.mongo')

const converterConfig = {
  gtfsrt: {
    mongoConfig: nytMongoConfig,
    filterConditions: {
      // startTimestamp:  1497514043 ,
      // endTimestamp: 1497585566,
      // resultsLimit: 3,
    }
  }
}

const engine = new ConverterServiceEngine(converterConfig)

const actor = new BaseDataUploader(baseDataMongoConfig)

engine.registerActor(actor)

engine.run()
  .then(() => console.log('upload done'))
  .catch((err) => console.error(err))
