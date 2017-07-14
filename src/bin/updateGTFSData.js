#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const child_process = require('child_process')
const mkdirp = require('mkdirp')

const updateGTFSDataScriptPath = path.join(__dirname, '../../node_modules/.bin/updateGTFSData')

const GTFSFeedConfigFactory = require('../config/gtfs/gtfsStatic/GTFSFeedConfigFactory/')

const argv = require('minimist')(process.argv.slice(2))

const { feedName, sourceType } = argv

const usageMessage = `USAGE:

    * the feedName argument is required. Specify it as follows:

        --feedName=<feed name>.

    * an options sourceType argument instructs the uploader either
      to use a zip archive whose path is specified in the configs,
      or to download the GTFS data from and url.

        [--sourceType=url|file]
          
    * example:

       ./bin/updateGTFSData.js --feedName=mta_subway --sourceType=file
`


if (!feedName) {
  console.error(usageMessage)
  process.exit(1)
}


let config = GTFSFeedConfigFactory.build({ feedName, source: 'FILE' })


const { workDirPath, gtfsConfigFilePath, uploaderMaxOldSpace } = config


// Write a config file for the updater to use.
mkdirp.sync(workDirPath)
fs.writeFileSync(gtfsConfigFilePath, `module.exports = ${JSON.stringify(config, null, 4)}`)


// The arguments to pass to the updater script.
const updaterArgs = [gtfsConfigFilePath]

if (sourceType) {
  updaterArgs.push(sourceType)
}


const command =
  `node --max-old-space-size=${uploaderMaxOldSpace} ` +
      `${updateGTFSDataScriptPath} ${gtfsConfigFilePath} ${sourceType||''}`

child_process.exec(command, (err, stdout, stderr) => {
  if (err) {
    console.error(err)
  }

  if (stdout) {
    console.log(stdout)
  }

  if (stderr) {
    console.log(stderr)
  }
})
