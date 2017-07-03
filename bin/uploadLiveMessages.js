#!/usr/bin/env node

const MockConfigsService = require('../code/converter/configsService/MockConfigsService')

const ConverterServiceEngine = require('../code/engines/ConverterServiceEngine')
const MessageUploader = require('../code/actors/converterService/MessageUploader')

const nytMongoConfig = require('../code/config/nyt.mongo')
const mongoConfig = Object.assign(
  {},
  nytMongoConfig,
  {
    mongoURL: 'mongodb://localhost:27017/mta_staten_island_LiveTest'
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
