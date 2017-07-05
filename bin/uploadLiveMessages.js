#!/usr/bin/env node

const MockConfigsService = require('../src/converter/configsService/MockConfigsService')

const ConverterServiceEngine = require('../src/engines/ConverterServiceEngine')
const MessageUploader = require('../src/actors/converterService/MessageUploader')

const nytMongoConfig = require('../src/config/nyt.mongo')
const mongoConfig = Object.assign(
  {},
  nytMongoConfig,
  {
    mongoURL: 'mongodb://localhost:27017/mta_subway_scrape'
  }
)

const httpServerConfig = MockConfigsService.getGTFSRealtimeConfig()

const converterConfig = {
  gtfsrt: {
    httpServerConfig
  }
}

const engine = new ConverterServiceEngine(converterConfig)
const actor = new MessageUploader(mongoConfig)

engine.registerActor(actor)

engine.run()
  .then(() => console.log('upload done'))
  .catch((err) => console.error(err))
