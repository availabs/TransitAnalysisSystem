#!/usr/bin/env node

const ConverterServiceEngine = require('../src/engines/ConverterServiceEngine')

const nytMongoConfig = require('../src/config/nyt.mongo')

const BaseDataUploader = require('../src/actors/converterService/BaseDataUploader')
const baseDataMongoConfig = require('../src/config/baseData.mongo')

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
