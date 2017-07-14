/* eslint no-unused-expressions: 0 */

'use strict'

const path = require('path')

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const { expect } = chai


const srcDir = path.join(__dirname, '../../../src/')

const GTFSFeedSource =
    require(path.join(srcDir, 'gtfs/gtfsStatic/GTFSFeedSource'))
const GTFSFeedConfigFactory =
    require(path.join(srcDir,'config/gtfs/gtfsStatic/GTFSFeedConfigFactory'))
const GTFSFeedHandlerFactory =
    require(path.join(srcDir, 'gtfs/gtfsStatic/GTFSFeedHandlerFactory'))

const GTFSrtFeedSource =
    require(path.join(srcDir, 'gtfs/gtfsRealtime/GTFSrtFeedSource'))
const GTFSrtFeedConfigFactory =
    require(path.join(srcDir,'config/gtfs/gtfsRealtime/GTFSrtFeedConfigFactory'))
const GTFSrtFeedHandlerFactory =
    require(path.join(srcDir, 'gtfs/gtfsRealtime/GTFSrtFeedHandlerFactory'))


const GTFSConverterConfig =
    require(path.join(srcDir, 'config/gtfs/converter/GTFSConverterConfig'))
const GTFSConverterServiceFactory =
    require(path.join(srcDir,'gtfs/converter/GTFSConverterServiceFactory'))
const GTFSConverterService =
    require(path.join(srcDir,'gtfs/converter/GTFSConverterService'))


const feedName = '_test_'


describe('GTFSConverterServiceFactory', function () {
  describe('when taking feed configs', function () {
    it('should return a GTFSConverterService when GTFSrtFeed source=FILE', function (done) {
      this.timeout(0) // no timeout

      const gtfsFeedConfig = GTFSFeedConfigFactory.build({ feedName, source: GTFSFeedSource.FILE })
      const gtfsrtFeedConfig =
          GTFSrtFeedConfigFactory.build({ feedName, source: GTFSrtFeedSource.FILE })
      const converterConfig = new GTFSConverterConfig({ feedName })

      expect(
        GTFSConverterServiceFactory.build({ gtfsFeedConfig, gtfsrtFeedConfig, converterConfig })
      ).to.eventually.be.an.instanceof(GTFSConverterService).and.notify(done)
    })

    it('should return a GTFSConverterService when GTFSrtFeed source=LIVE', function (done) {
      this.timeout(0) // no timeout

      const gtfsFeedConfig = GTFSFeedConfigFactory.build({ feedName, source: GTFSFeedSource.FILE })
      const gtfsrtFeedConfig =
          GTFSrtFeedConfigFactory.build({ feedName, source: GTFSrtFeedSource.LIVE })

      const converterConfig = new GTFSConverterConfig({ feedName })

      expect(
        GTFSConverterServiceFactory.build({ gtfsFeedConfig, gtfsrtFeedConfig, converterConfig })
      ).to.eventually.be.an.instanceof(GTFSConverterService).and.notify(done)
    })

    it('should return a GTFSConverterService when GTFSrtFeed source=MONGO', function (done) {
      this.timeout(0) // no timeout

      const gtfsFeedConfig = GTFSFeedConfigFactory.build({ feedName, source: GTFSFeedSource.FILE })
      const gtfsrtFeedConfig =
          GTFSrtFeedConfigFactory.build({
            feedName,
            source: GTFSrtFeedSource.MONGO,
            userLevel: 'READ_ONLY'
          })
      const converterConfig = new GTFSConverterConfig({ feedName })

      expect(
        GTFSConverterServiceFactory.build({ gtfsFeedConfig, gtfsrtFeedConfig, converterConfig })
      ).to.eventually.be.an.instanceof(GTFSConverterService).and.notify(done)
    })
  })

  describe('when taking pre-build components configs', function () {
    it('should return a GTFSConverterService when GTFSrtFeedHandler passed in', function (done) {
      this.timeout(0) // no timeout

      const gtfsFeedConfig = GTFSFeedConfigFactory.build({ feedName, source: GTFSFeedSource.FILE })
      const gtfsrtFeedConfig = GTFSrtFeedConfigFactory.build({ feedName, source: GTFSrtFeedSource.LIVE })
      const converterConfig = new GTFSConverterConfig({ feedName })

      expect(
        Promise.all([
          GTFSFeedHandlerFactory.build(gtfsFeedConfig),
          GTFSrtFeedHandlerFactory.build(gtfsrtFeedConfig)
        ]).then(
          ([gtfsFeedHandler, gtfsrtFeedHandler]) =>
            GTFSConverterServiceFactory.build({ gtfsFeedHandler, gtfsrtFeedHandler, converterConfig })
        )
      ).to.eventually.be.an.instanceof(GTFSConverterService).and.notify(done)
    })
  })

})
