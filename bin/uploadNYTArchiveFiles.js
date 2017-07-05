#!/usr/bin/env node

const ConverterServiceEngine = require('../src/engines/ConverterServiceEngine')
const MessageUploader = require('../src/actors/converterService/MessageUploader')

const nytFilesConfig = require('../src/config/nyt.files')
const nytMongoConfig = require('../src/config/nyt.mongo')
// const mongoConfig = Object.assign({}, nytMongoConfig, { mongoURL: `${nytMongoConfig.mongoURL}_TEST` })
const converterConfig = {
  gtfsrt: {
    fileSystemConfig: nytFilesConfig
  }
}

const engine = new ConverterServiceEngine(converterConfig)
const actor = new MessageUploader(nytMongoConfig)

engine.registerActor(actor)

engine.run()
  .then(() => console.log('upload done'))
  .catch((err) => console.error(err))
