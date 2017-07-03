const baseMongoConfig = require('./mongodb.config')

module.exports = Object.freeze(
  Object.assign(
    {},
    baseMongoConfig,
    {
      mongoURL: `${baseMongoConfig.mongoURL}/mta_subway`,
      gtfsrtCollectionName: 'gtfsrt',
      trainTrackerCollectionName: 'trainTracker',
    }
  )
)

