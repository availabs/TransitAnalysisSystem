#!/usr/bin/env node

const ConverterServiceEngine = require('../src/engines/ConverterServiceEngine')
const EchoTimestampsFeedActor = require('../src/actors/converterService/EchoTimestampsFeedActor')

const nytMongoConfig = require('../src/config/nyt.mongo')

const config = {
  gtfsrt: {
    mongoConfig: nytMongoConfig,
    filterConditions: {
      // startTimestamp:  1497514043 ,
      // endTimestamp: 1497585566,
      resultsLimit: 3,
    }
  }
}

const engine = new ConverterServiceEngine(config)
const actor = new EchoTimestampsFeedActor()

engine.registerActor(actor)

engine.run()
  .then(() => console.log('echoTimestamps done'))
  .catch((err) => console.error(err))
