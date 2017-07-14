'use strict'


const path = require('path')


const GTFSFeedConfigDefaults = require('./GTFSFeedConfigDefaults')

const feedConfigs = require('../../feeds/')


class FileSystemGTFSFeedConfig extends GTFSFeedConfigDefaults {
  constructor (options = {}) {
    super(options)

    const { feedName } = options

    const { gtfs: feedConfig } = feedConfigs[feedName]

    Object.assign(this, feedConfig, options)

    this.workDirPath = options.workDirPath
        || feedConfig.workDirPath
        || path.join(this.dataDirPath, 'tmp/')

    this.gtfsConfigFilePath = options.gtfsConfigFilePath
        || feedConfig.gtfsConfigFilePath
        || path.join(this.workDirPath, `${feedName}Config.js`)

    this.feedDataZipFilePath = options.feedDataZipFilePath
        || feedConfig.feedDataZipFilePath
        || path.join(this.dataDirPath, this.feedDataZipFileName)

    this.indexedScheduleDataFilePath = options.indexedScheduleDataFilePath
        || feedConfig.indexedScheduleDataFilePath
        || path.join(this.dataDirPath, 'indexedScheduleData.json')

    this.indexedSpatialDataFilePath = options.indexedSpatialDataFilePath
        || feedConfig.indexedSpatialDataFilePath
        || path.join(this.dataDirPath, 'indexedSpatialData.json')
  }

  // Multiple feeds can share the indexed data of this feed.
  set share (flag) {
    this.share = !!flag
  }
}


module.exports = FileSystemGTFSFeedConfig
