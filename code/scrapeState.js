'use strict'


const path = require('path')
const request = require('request')
const MongoClient = require('mongodb').MongoClient


const confPath = path.join(__dirname, '/../../../config/server.json')
let adminKey = JSON.parse(require('fs').readFileSync(confPath)).adminKey

const siriServerURL = 'http://localhost:16181/admin/get/server/state?key=' + adminKey
//let siriServerURL = 'http://siri.mta.availabs.org/admin/get/server/state?key=NoSuchPlace'

const dotPlaceholder = '\u0466'

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/mta_gtfsrt", function (err, db) {
    if(err) {
      return
    }

    const gtfsrtCollection = db.collection('messages')
    const trainTrackerCollection = db.collection('trainTracker')

    console.log("We are connected to Mongo.")

    let lastTimestamp = null

    setInterval(function () {
        request(siriServerURL, function (error, response, body) {
            if (error) {
              console.error(error)
              return
            }

            if (response.statusCode !== 200) {
              console.log('response.statusCode:', response.statusCode)
              return
            }

            let serverState = JSON.parse(body) ,
                timestamp   = serverState.gtfsrtTimestamp,
                gtfsrtDoc = { _id: timestamp, state: cleanKeys(serverState.GTFSrt_JSON) },
                trainTrackerDoc = { _id: timestamp, state: cleanKeys(serverState.trainTrackerState) }

            if (timestamp <= lastTimestamp) {
             return
            }

            lastTimestamp = timestamp

            gtfsrtCollection.insert(gtfsrtDoc, { checkKeys: false }, function (err2) {
                if (err2) {
                    console.log(err2)
                    return
                } else {
                    trainTrackerCollection.insert(trainTrackerDoc, { checkKeys: false }, (err3) => {
                        if (err3) {
                            console.log(err3)
                            return
                        }
                        console.log(timestamp)
                    })
                }
            })
        })
    }, 1000)

})


// Because mongo keys cannot contain a '.'.
function cleanKeys (obj) {

    let keys = ((obj !== null) && (typeof obj === 'object')) ? Object.keys(obj) : null

    if (keys) {
        return keys.reduce(function (acc, key) {
            acc[key.replace(/\./g, dotPlaceholder)] = cleanKeys(obj[key])
            return acc
        }, Array.isArray(obj) ? [] : {})
    } else {
        return obj
    }
}
