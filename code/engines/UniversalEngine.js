'use strict'

// Because the actors may have cleanup code,
//    if we want to ensure an error message
//    we need the following event handler...
process.on('uncaughtException', (err) => {
  console.error(err)
})

const MockConverterServiceFactory = require('../converter/ConverterServiceFactory')
const _ = require('lodash')


class UniversalEngine {

  constructor (config) {

    console.log(JSON.stringify(config, null, 4))

    this.actors = []
    this.config = config
  }

  registerActor (actor) {
    this.actors.push(actor)
  }

  removeActor (actor) {
    _.pull(this.actors, actor)
  }

  async run () {
    let converterService

    return MockConverterServiceFactory.build(this.config)
      .then(
        _converterService => (converterService = _converterService),
      ).then(
        () => converterService.open()
      ).then(
        () => runReports.call(this, converterService)
      ).catch(
        err => console.error(err)
      )
  }
}


async function runReports (converterService) {

  while (true) {
    const data = await converterService.next()

    if (data === null) {
      break
    }

    const {
      gtfsrtJSON,
      siriObj,
      converterUpdate
    } = data

    await Promise.all(
      this.actors.map(
        actor => actor(gtfsrtJSON, siriObj, converterUpdate)
      )
    )
  }

  return converterService.close()
}


module.exports = UniversalEngine

