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

    const that = {
      dotPlaceholder
    }

    this.cleanKeys = _cleanKeys.bind(that)
    this.restoreKeys = _restoreKeys.bind(that)
  }
}

function _cleanKeys (obj) {
  let keys = ((obj !== null) && (typeof obj === 'object')) ? Object.keys(obj) : null

  if (keys) {
    return keys.reduce((acc, key) => {
      acc[key.replace(/\./g, this.dotPlaceholder)] = _cleanKeys.call(this, obj[key])
      return acc
    }, Array.isArray(obj) ? [] : {})
  } else {
    return obj
  }
}

function _restoreKeys (obj) {
  const dotPlaceholderRegExp = new RegExp(this.dotPlaceholder)
  const keys = ((obj !== null) && (typeof obj === 'object')) ? Object.keys(obj) : null

  if (keys) {
    return keys.reduce((acc, key) => {
      let restoredKey = (dotPlaceholderRegExp.test(key)) ? key.replace(dotPlaceholderRegExp, '.') : key
      acc[restoredKey] = _restoreKeys.call(this, obj[key])
      return acc
    }, Array.isArray(obj) ? [] : {})
  } else {
    return obj
  }
}

module.exports = MongoKeyHandler
