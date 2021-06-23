import { F, always, equals, findIndex, gte, ifElse, pickAll } from 'ramda'

/**
 * @type Logger = {
 *     error :: String -> _,
 *     info :: String -> _,
 *     debug :: String -> _,
 *     warn :: String -> _,
 * }
 */

export const LEVEL_ERROR = 'ERROR'
export const LEVEL_WARN = 'WARN'
export const LEVEL_INFO = 'INFO'
export const LEVEL_DEBUG = 'DEBUG'

export const levels = [
  LEVEL_ERROR,
  LEVEL_WARN,
  LEVEL_INFO,
  LEVEL_DEBUG,
]

// resolveLogLevelIndex :: String -> Number
const resolveLogLevelIndex = level => findIndex(equals(level), levels)

// loggerHead :: (String, String) -> Boolean
const shouldPrintLog = (loggerLevel, logLevel) => gte(
  resolveLogLevelIndex(loggerLevel),
  resolveLogLevelIndex(logLevel),
)

// loggerHead :: String-> String
const loggerHead = type => `[${(new Date()).toISOString()}] ${type.toUpperCase()}:`

// error :: (String, Output) -> Function
const error = (level, output) => ifElse(
  level => shouldPrintLog(level, LEVEL_ERROR),
  () => (...args) => output.error(loggerHead(LEVEL_ERROR), ...args),
  always(F),
)(level)

// warn :: (String, Output) -> Function
const warn = (level, output) => ifElse(
  level => shouldPrintLog(level, LEVEL_WARN),
  () => (...args) => output.warn(loggerHead(LEVEL_WARN), ...args),
  always(F),
)(level)

// info :: (String, Output) -> Function
const info = (level, output) => ifElse(
  level => shouldPrintLog(level, LEVEL_INFO),
  () => (...args) => output.info(loggerHead(LEVEL_INFO), ...args),
  always(F),
)(level)

// debug :: (String, Output) -> Function
const debug = (level, output) => ifElse(
  level => shouldPrintLog(level, LEVEL_DEBUG),
  () => (...args) => output.log(loggerHead(LEVEL_DEBUG), ...args),
  always(F),
)(level)

// formatException :: Error -> String
export const formatException = e => JSON.stringify(pickAll(['code', 'message', 'stack'], e))

// createLogger :: (String, Output) -> Logger
export default (level, output) => ({
  error: error(level, output),
  info: info(level, output),
  debug: debug(level, output),
  warn: warn(level, output),
})
