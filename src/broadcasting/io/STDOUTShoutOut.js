// Simple example Actor

'use strict'


class STDOUTShoutOut {
  constructor () {}

  async receiveMessage (msg) {
    process.stdout.write(JSON.stringify(msg) + '\n')
  }

  async teardown () {
    return
  }
}


module.exports = STDOUTShoutOut
