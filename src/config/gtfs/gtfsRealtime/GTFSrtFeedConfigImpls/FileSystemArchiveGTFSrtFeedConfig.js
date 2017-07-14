'use strict'


const GTFSrtFeedConfig = require('./GTFSrtFeedConfig')


class FileSystemArchiveGTFSrtFeedConfig extends GTFSrtFeedConfig {
  constructor (options = {}) {
    super(options)
    Object.assign(this, options)
  }
}


module.exports = FileSystemArchiveGTFSrtFeedConfig


