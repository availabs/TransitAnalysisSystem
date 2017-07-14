'use strict'

const { MongoClient } = require('mongodb')

const GTFSDerivedDataUploader = require('./GTFSDerivedDataUploader')

const MongoKeyHandler = require('../../../../utils/MongoKeyHandler')


class GTFSDerivedDataUploaderFactory {

  static async build (mongoConfig) {

    const {
      mongoURL,
      derivedDataCollectionName,
      dotPlaceholder,
    } = mongoConfig

    const db = await MongoClient.connect(mongoURL)
    const derivedDataCollection = db.collection(derivedDataCollectionName)
    const mongoKeyHandler = new MongoKeyHandler(dotPlaceholder)

    const uploaderConfig = {
      db,
      derivedDataCollection,
      mongoKeyHandler,
    }

    return new GTFSDerivedDataUploader(uploaderConfig)
  }
}


module.exports = GTFSDerivedDataUploaderFactory
