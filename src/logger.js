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

const resolveLogLevelIndex = level => levels.indexOf(level)

const shouldPrintLog = (loggerLevel, logLevel) => (
  resolveLogLevelIndex(loggerLevel) >= resolveLogLevelIndex(logLevel)
)

const loggerHead = type => `[${(new Date()).toISOString()}] ${type.toUpperCase()}:`

const noop = () => false

const error = (level, output) => (
  shouldPrintLog(level, LEVEL_ERROR)
    ? (...args) => output.error(loggerHead(LEVEL_ERROR), ...args)
    : noop
)

const warn = (level, output) => (
  shouldPrintLog(level, LEVEL_WARN)
    ? (...args) => output.warn(loggerHead(LEVEL_WARN), ...args)
    : noop
)

const info = (level, output) => (
  shouldPrintLog(level, LEVEL_INFO)
    ? (...args) => output.info(loggerHead(LEVEL_INFO), ...args)
    : noop
)

const debug = (level, output) => (
  shouldPrintLog(level, LEVEL_DEBUG)
    ? (...args) => output.log(loggerHead(LEVEL_DEBUG), ...args)
    : noop
)

export const formatException = e => JSON.stringify({
  code: e?.code,
  message: e?.message,
  stack: e?.stack,
})

export default (level, output) => ({
  error: error(level, output),
  info: info(level, output),
  debug: debug(level, output),
  warn: warn(level, output),
})
