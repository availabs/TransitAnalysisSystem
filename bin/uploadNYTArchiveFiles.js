#!/usr/bin/env node

const ConverterServiceEngine = require('../code/engines/ConverterServiceEngine')
const MessageUploader = require('../code/actors/converterService/MessageUploader')

const nytFilesConfig = require('../code/config/nyt.files')
const nytMongoConfig = require('../code/config/nyt.mongo')
const mongoConfig = Object.assign({}, nytMongoConfig, { mongoURL: `${nytMongoConfig.mongoURL}_TEST` })

const converterConfig = {
  gtfsrt: {
    fileSystemConfig: nytFilesConfig
  }
}

const engine = new ConverterServiceEngine(converterConfig)
const actor = new MessageUploader(mongoConfig)

engine.registerActor(actor)

engine.run()
  .then(() => console.log('upload done'))
  .catch((err) => console.error(err))
