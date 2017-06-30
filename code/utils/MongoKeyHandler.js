/*
 * Because MongoDB object keys cannot contain a '.',
 * the first step in uploading GTFS Realtime messages
 * is to replace them with a different character.
 *
 * When reading from the datastore, we need to restore
 * the '.' in the keys.
 */

'use strict'


class MongoKeyHandler {
  constructor (dotPlaceholder) {
    if (!dotPlaceholder) {
      throw new Error('dotPlaceholder is required.')
    }
    this.dotPlaceholder = dotPlaceholder
  }

  cleanKeys (obj) {
    return _cleanKeys(obj, this.dotPlaceholder)
  }

  restoreKeys (obj) {
    return _restoreKeys(obj, this.dotPlaceholder)
  }
}

function _cleanKeys (obj, dotPlaceholder) {
  let keys = ((obj !== null) && (typeof obj === 'object')) ? Object.keys(obj) : null

  if (keys) {
    return keys.reduce(function (acc, key) {
      acc[key.replace(/\./g, dotPlaceholder)] = _cleanKeys(obj[key], dotPlaceholder)
      return acc
    }, Array.isArray(obj) ? [] : {})
  } else {
    return obj
  }
}

function _restoreKeys (obj, dotPlaceholder) {
  const dotPlaceholderRegExp = new RegExp(dotPlaceholder)
  const keys = ((obj !== null) && (typeof obj === 'object')) ? Object.keys(obj) : null

  if (keys) {
    return keys.reduce(function (acc, key) {
      let restoredKey = (dotPlaceholderRegExp.test(key)) ? key.replace(dotPlaceholderRegExp, '.') : key
      acc[restoredKey] = _restoreKeys(obj[key], dotPlaceholder)
      return acc
    }, Array.isArray(obj) ? [] : {})
  } else {
    return obj
  }
}

module.exports = MongoKeyHandler
