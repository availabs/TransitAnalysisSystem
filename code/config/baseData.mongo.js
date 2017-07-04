const baseMongoConfig = require('./mongodb.config')

module.exports = Object.freeze({
  mongoURL: `${baseMongoConfig.mongoURL}/mta_subway_base_data`,
  dotPlaceholder: baseMongoConfig.dotPlaceholder,
  baseDataCollectionName: 'base_data'
})
