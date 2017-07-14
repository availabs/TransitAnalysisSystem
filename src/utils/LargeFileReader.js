'use strict'

const fs = require('fs')
const _ = require('lodash')
const JSONStream = require('JSONStream')
const es = require('event-stream')

class LargeFileReader {

  static parse (filePath) {
    return new Promise((resolve, reject) => {
      const obj = {}
      fs.createReadStream(filePath)
        .pipe(
          JSONStream.parse([true, { emitPath: true }])
        ).pipe(es.mapSync((data) => {
          _.set(obj, data.path, data.value)
        })).on('end', () => {
          resolve(obj)
        }).on('error', (err) => {
          reject(err)
        })
    })
  }
}

module.exports = LargeFileReader

