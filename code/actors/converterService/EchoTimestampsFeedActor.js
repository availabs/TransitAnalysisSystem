// Simple example Actor

'use strict'

class EchoTimestampsFeedActor {

  async receiveMessage (gtfsrtJSON) {
    try {
      console.log(+gtfsrtJSON.header.timestamp.low)
    } catch (err) {
      console.error(err)
    }

    return
  }

  async teardown () {
    return new Promise(resolve =>
      process.nextTick(() => resolve())
    )
  }
}

module.exports = EchoTimestampsFeedActor

