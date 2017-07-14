// TODO: This module should wrap the converterUpdate in a class
//       that combines the GTFS, GTFSrt, and Converter interfaces.
//       The VehicleActivity array should be a simple iterable.
//       The elements of the literal should be wrapped in a class
//         that provide clean getters where keys are not required.
//       The listeners that receive messages from this actor must
//         operate at a higher level of abstraction.
//       That would allow them to consume SIRI or other formats, as well.

'use strict'


class GTFSMessageDispatcher {
  constructor (options) {
    if (!options.gtfsConverterService) {
      throw new Error('The gtfsConverterService is a required parameter')
    }

    const that = {
      gtfsConverterService: options.gtfsConverterService,
      listeners: options.listeners || [],
    }

    this.registerListener = _registerListener.bind(that)
    this.run = _run.bind(that)
    this.teardown = _teardown.bind(that)
  }
}

function _registerListener (actor) {
  this.listeners.push(actor)
}

async function _run () {
  await this.gtfsConverterService.open()
  await _kickItOff.call(this, this.gtfsConverterService)
}

async function _kickItOff (converterService) {

  let actorErr = null

  while (true && !actorErr) {

    const converterUpdate = await converterService.next()

    if (converterUpdate === null) {
      break
    }

    if (!converterUpdate) {
      continue
    }

    await Promise.all(
      this.listeners.map(
        actor => actor.receiveMessage(converterUpdate)
      )
    ).catch((err) => {
      console.log(err)
      actorErr = err
    })
  }

  await converterService.close()

  if (actorErr) {
    throw actorErr
  }
}


function _teardown () {
  this.gtfsConverterService = null
  this.listeners = null
}


module.exports = GTFSMessageDispatcher

