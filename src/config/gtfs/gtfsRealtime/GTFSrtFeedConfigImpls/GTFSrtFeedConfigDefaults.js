'use strict'


const path = require('path')

const protofileDirPath = path.join(__dirname, '../../../../../protofiles/')


class GTFSrtFeedConfigDefaults {
  constructor () {
    this.protofileDirPath = protofileDirPath
    this.useLastStoptimeUpdateAsDestination = true
    this.protofileName = 'gtfs-realtime.proto'
    this.readInterval = 60
    this.retryInterval = 3
    this.maxNumRetries = 5
  }
}


module.exports = GTFSrtFeedConfigDefaults
