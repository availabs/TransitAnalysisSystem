#!/usr/bin/env node

const ConverterServiceEngine = require('../src/engines/ConverterServiceEngine')
const MessageUploader = require('../src/actors/converterService/MessageUploader')

const {
  converter: converterConfig,
  uploader: uploaderConfig,
} = require('../config/').uploadNYTArchiveConfig

// TODO: Pass the Mongo Collections in through config.
//       Will enable sharing connections.
const engine = new ConverterServiceEngine(converterConfig)

const actor = new MessageUploader(uploaderConfig)

engine.registerActor(actor)

engine.run()
  .then(() => console.log('upload done'))
  .catch((err) => console.error(err))
