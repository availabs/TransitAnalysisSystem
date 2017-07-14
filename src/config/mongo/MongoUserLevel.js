'use strict'

const Enum = require('enumify').Enum


class MongoUserLevel extends Enum {}

MongoUserLevel.initEnum([
  'ADMIN',
  'READ_WRITE',
  'READ_ONLY',
])


module.exports = MongoUserLevel

