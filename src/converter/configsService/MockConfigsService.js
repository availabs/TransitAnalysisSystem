'use strict'


const path = require('path')

const ConfigsService = require(path.join(__dirname, '../../../node_modules/MTA_Subway_SIRI_Server/src/services/ConfigsService'))


const configGetterPattern = /^get.*Config$/
const addListenerPattern  = /^add.*Listener$/
const removeListenerPattern = /^remove.*Listener/

const logFilePathPattern = /^.*LogPath$/


const listeners    = []
const interceptors = []

const mockLogsDir = path.join(__dirname, '../../../logs/')


function redirectLogs (config) {
  if (config && (typeof config === 'object')) {
    return Object.keys(config).reduce(function (acc, key) {
      if (logFilePathPattern.test(key)) {
        let basename = path.basename(config[key])
        acc[key] = path.join(mockLogsDir, basename)
      } else {
        acc[key] = config[key]
      }

      return acc
    }, {})
  } else {
    return config
  }
}

let mockConfigService = Object.keys(ConfigsService).reduce(function (acc, key) {
  let i

  switch (true) {
  case configGetterPattern.test(key) :
        // Replace the config getter with one that redirects the log output.
    acc[key] = function () {
      return redirectLogs(ConfigsService[key]())
    }
//acc[key] = function () { var conf = redirectLogs(ConfigsService[key]()); console.log(conf); return conf; } ;
    break

  case addListenerPattern.test(key) :
    acc[key] = function (listener) {
      i = (listeners.push(listener) - 1)  //Index of the newly added listener;

            // Create an interceptor for the listener
            // and push it to the interceptors list.
      interceptors.push(function (config) {
        listener(redirectLogs(config))
      })

            // Add the interceptor as a listener in the ConfigsService.
      ConfigsService[key](interceptors[i])
    }
    break

  case removeListenerPattern.test(key) :
    acc[key] = function (listener) {
            // If we have wrapped the listener with an interceptor,
            // remove the listener and interceptor from their list,
            // and remove the interceptor from the ConfigService listeners.
      if ((i = listeners.indexOf(listener)) > -1) {
        listeners.splice(i, 1)
        ConfigsService[key](interceptors.splice(i,1))
      }
    }
    break

  default :
    acc[key] = ConfigsService[key]
    break
  }

  return acc
}, {})


module.exports = mockConfigService