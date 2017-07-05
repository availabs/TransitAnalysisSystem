#!/usr/bin/env node
'use strict'

const fs = require('fs')
const { Transform } = require('stream')
const csv = require('fast-csv')

const MongoClient = require('mongodb').MongoClient

const mongoURL = 'mongodb://localhost:27017/mta_subway_base_data'
const baseDataCollectionName = 'base_data'
const dotPlaceholder = '\u0466'
const MongoKeyHandler = require('../code/utils/MongoKeyHandler')
const mongoKeyHandler = new MongoKeyHandler(dotPlaceholder)


let db

MongoClient.connect(mongoURL)
  .then(
    (_db) => (db = _db)
  ).then(
    () => db.collection(baseDataCollectionName).find({}).sort({_id: 1})
  )
  .then(
    (cursor) => cursor.stream()
  )
  .then(
    (dataStream) => handleDataStream(dataStream)
  ).then(
    () => db.close()
  ).then(
    () => console.log('done')
  ).catch(
    (err) => console.error(err)
  )


function handleDataStream (dataStream) {
  return new Promise((resolve, reject) => {

    dataStream.pipe(
      new Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        transform (chunk, encoding, callback) {
          const data = mongoKeyHandler.restoreKeys(chunk.state)

          Object.keys(data).sort()
            .forEach((tripId) => this.push(data[tripId]))

          callback(null)
        }
      })
    ).pipe(
      csv.createWriteStream({
        discardUnmappedColumns: true,
        headers: true,
        ignoreEmpty: true,
        quoteColumns: true,
        strictColumnHandling: true,
      })
    ).pipe(
      fs.createWriteStream('/tmp/mta.test.csv')
    ).on('error',
      reject
    ).on('finish',
      resolve
    )
  })
}
