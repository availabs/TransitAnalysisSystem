//:==== Mongo:====
// https://docs.mongodb.com/manual/reference/connection-string/
// mongodb://[username:password@]host1[:port1][/[database][?options]]

'use strict'


const invalidCharacterRegExp = /\/\."\$/
const mongoEntityNameRegExp = /(?:collectionname)|(?:dbname)/i


function buildMongoConnectionString ({ host, port, username, password, dbName, adminDbName }) {

  // Check if either both, or neither, defined.
  if (!username !== !password) {
    throw new Error('Username and password must both be provided, or neither provided.')
  }

  const auth = (username) ? `${username}:${password}@` : ''

  const authSourceQueryParam = adminDbName ? `?authSource=${adminDbName}` : ''
  return `mongodb://${auth}${host}${port?`:${port}`:''}/${dbName||''}${authSourceQueryParam}`
}


function validateEntityNames (config) {
  const nameParams = Object.keys(config).filter(k => k.match(mongoEntityNameRegExp))
  const invalidNames = nameParams.filter(k => k.match(invalidCharacterRegExp))

  if (invalidNames.length) {
    throw new Error(
      'The following Mongo entity names are invalid: [${invalidNames}].' +
      'Please see: https://docs.mongodb.com/manual/reference/limits/#naming-restrictions'
    )
  }
}


module.exports = {
  buildMongoConnectionString,
  validateEntityNames,
}
