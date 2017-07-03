'use strict'


const MockConverterServiceFactory = require('../converter/ConverterServiceFactory')

class ConverterServiceEngine {

  constructor (config) {
    this.actors = []
    this.config = config
  }

  registerActor (actor) {
    this.actors.push(actor)
  }

  async run () {
    let converterService

    return MockConverterServiceFactory.build(this.config)
      .then(
        _converterService => (converterService = _converterService),
      ).then(
        () => converterService.open()
      ).then(
        () => activateActors.call(this, converterService)
      ).catch(
        err => console.error(err)
      )
  }
}


async function activateActors (converterService) {

  let actorErr = null

  while (true && !actorErr) {
    const data = await converterService.next()

    if (data === null) {
      break
    }

    const {
      gtfsrtJSON,
      siriObj,
      converterUpdate
    } = data || {}

    if (!gtfsrtJSON) {
      continue
    }

    await Promise.all(
      this.actors.map(
        actor => actor.receiveMessage(gtfsrtJSON, siriObj, converterUpdate)
      )
    ).catch((err) => {
      console.log(err)
      actorErr = err
    })
  }

  await converterService.close()

  await Promise.all(
    this.actors.map(actor =>
      actor.teardown()
    )
  )

  if (actorErr) {
    throw actorErr
  }
}


module.exports = ConverterServiceEngine

