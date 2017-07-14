/* eslint no-unused-expressions: 0 */

'use strict'


const expect  = require('chai').expect

const LoggingConfig = require('../../../src/config/logging/LoggingConfig')

const feedName = 'mta_subway'


describe('Logging user config creation', function () {
  it('should return something without crashing', function () {
    const loggingConfig = new LoggingConfig({ feedName })
    expect(loggingConfig).to.exist
  })
})

