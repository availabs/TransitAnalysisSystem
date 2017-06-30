'use strict'

const path = require('path')

const dataDirPath = path.join(__dirname, '../nyt/data/2017-06-15/')

const ConverterService = require(path.join(__dirname, '/MockConverterService'))

const fileUploader = require('./ProtoBufFileUploader')


const MockGTFSrtFeed = require(path.join(__dirname, '/MockGTFS-Realtime_Feed.FileSystem'))

const mockGTFSrtFeed = new MockGTFSrtFeed(dataDirPath)


ConverterService.registerListener(fileUploader)

ConverterService.start(mockGTFSrtFeed)
