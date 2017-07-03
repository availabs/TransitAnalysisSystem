/* eslint dot-notation: "off", no-lonely-if: "off" */
'use strict'

class EchoTimestampsFeedActor {

  async getFeedMessage (gtfsrtJSON) {
    try {
      console.log(+gtfsrtJSON.header.timestamp.low)
    } catch (err) {
      console.error(err)
    }

    return
  }
}

module.exports = EchoTimestampsFeedActor

