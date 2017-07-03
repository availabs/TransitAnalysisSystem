#!/usr/bin/env node

const ConverterServiceEngine = require('../code/engines/ConverterServiceEngine')
const EchoTimestampsFeedActor = require('../code/actors/converterService/EchoTimestampsFeedActor')

const nytMongoConfig = require('../code/config/nyt.mongo')

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
