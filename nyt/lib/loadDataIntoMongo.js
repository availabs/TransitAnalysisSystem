#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')
const async = require('async')

const protofilePath = path.join(__dirname, '../proto_files/nyct-subway.proto')
const dataDirPath = path.join(__dirname, '../data/2017-06-15/')

const MongoClient = require('mongodb').MongoClient
const mongoURL = "mongodb://localhost:27017/mta_gtfsrt"


const ProtoBuf = require('protobufjs')

const dotPlaceholder = '\u0466'

const decoder =  ProtoBuf.protoFromFile(protofilePath)
                         .build('transit_realtime')
                         .FeedMessage.decode

const dataFilesList = fs.readdirSync(dataDirPath).sort()

let ctr = 0

// Connect to the db
MongoClient.connect(mongoURL, (err, db) => {
    if(err) {
      throw err
    }

    console.log(`connected to mongo at ${mongoURL}`)

    const gtfsrtCollection = db.collection('messages')

    let lastTimestamp = Number.NEGATIVE_INFINITY

    async.eachSeries(dataFilesList, (fileName, cb) => {
      ++ctr

      const filePath = path.join(dataDirPath, fileName)
      const msg = fs.readFileSync(filePath)

      let gtfsrt

      try {
        gtfsrt = decoder(msg)
      } catch (err2) {
        console.error(`WARNING: unable to decode file #${ctr}: ${fileName}`)
        // keep going
        return cb(null)
      }

      const timestamp = +(gtfsrt.header.timestamp.low) || null

      if (timestamp <= lastTimestamp) {
        return cb(null)
      }

      lastTimestamp = timestamp

      const gtfsrtDoc = {
        _id: timestamp,
        state: cleanKeys(gtfsrt)
      }

      gtfsrtCollection.insert(gtfsrtDoc, { checkKeys: false }, (err3) => {
        if (err3) {
          console.error(err)
          return cb(err3)
        }

        return cb(null)
      })
    }, (err4) => {
      db.close() // close connection to mongo

      if (err4) {
        throw err4
      }

      console.log('done')
    })
})


// Because mongo keys cannot contain a '.'.
function cleanKeys (obj) {

    const keys = ((obj !== null) && (typeof obj === 'object')) ? Object.keys(obj) : null

    if (keys) {
      return keys.reduce(function (acc, key) {
          acc[key.replace(/\./g, dotPlaceholder)] = cleanKeys(obj[key]) // Recursive call to cleanKeys
          return acc
      }, Array.isArray(obj) ? [] : {})
    } else {
      return obj
    }
}
