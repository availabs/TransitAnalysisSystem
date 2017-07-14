/* eslint no-unused-expressions: 0 */

'use strict'


const expect  = require('chai').expect

const GTFSConverterConfig = require('../../../../src/config/gtfs/converter/GTFSConverterConfig')

const feedName = 'mta_subway'


describe('GTFS File System Feed Handler config creation', function () {
  it('should return something without crashing using enum', function () {
    this.timeout(0) //disable timeout
    const converterConfig = new GTFSConverterConfig({ feedName })
    expect(converterConfig).to.exist
  })
})
