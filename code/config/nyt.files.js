const path = require('path')

module.exports = {
  mongoURL: 'mongodb://localhost:27017/nyt-files',
  gtfsrtCollectionName: 'gtfsrt',
  trainTrackerCollectionName: 'trainTracker',
  dotPlaceholder: '\u0466',
  dataDir: path.join(__dirname, '../../nyt/data/2017-06-15/')
}
