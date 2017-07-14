'use strict'


class GTFSConfig {
  constructor ({ gtfsFeedConfig, gtfsrtFeedConfig, gtfsConverterConfig }) {
    this.gtfsFeedConfig = gtfsFeedConfig
    this.gtfsrtFeedConfig = gtfsrtFeedConfig
    this.gtfsConverterConfig = gtfsConverterConfig
  }
}


module.exports = GTFSConfig
