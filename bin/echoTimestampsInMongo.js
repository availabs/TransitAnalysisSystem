#!/usr/bin/env node

const UniversalEngine = require('../code/engines/UniversalEngine')
const EchoTimestampsFeedActor = require('../code/actors/EchoTimestampsFeedActor')

const nytMongoConfig = require('../code/config/nyt.mongo')

const config = {
  gtfsrt: {
    mongoConfig: nytMongoConfig
  }
}

const engine = new UniversalEngine(config)
const actor = new EchoTimestampsFeedActor()

engine.registerActor(actor.getFeedMessage)

engine.run()
  .then(() => console.log('echoTimestamps done'))
  .catch((err) => console.error(err))
