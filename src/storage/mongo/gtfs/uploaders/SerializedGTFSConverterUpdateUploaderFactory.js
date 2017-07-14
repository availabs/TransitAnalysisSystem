'use strict'

const { MongoClient } = require('mongodb')

const SerializedGTFSConverterUpdateUploader = require('./SerializedGTFSConverterUpdateUploader')

const MongoKeyHandler = require('../../../../utils/MongoKeyHandler')


class SerializedGTFSConverterUpdateUploaderFactory {

  static async build (mongoConfig) {

    const {
      mongoURL,
      gtfsrtCollectionName,
      trainTrackerCollectionName,
      dotPlaceholder,
    } = mongoConfig

    const db = await MongoClient.connect(mongoURL)
    const gtfsrtCollection = db.collection(gtfsrtCollectionName)
    const trainTrackerCollection = db.collection(trainTrackerCollectionName)
    const mongoKeyHandler = new MongoKeyHandler(dotPlaceholder)

    const uploaderConfig = {
      db,
      gtfsrtCollection,
      trainTrackerCollection,
      mongoKeyHandler,
    }

    return new SerializedGTFSConverterUpdateUploader(uploaderConfig)
  }
}


module.exports = SerializedGTFSConverterUpdateUploaderFactory
