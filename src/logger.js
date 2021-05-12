import { __, bind, equals, findIndex, gt, gte, partial, pipe, when, pickAll } from 'ramda'

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
const resolveLogLevelIndex = pipe(
    level => findIndex(equals(level), levels),
    when(gt(0), levels.length),
)

// loggerHead :: (String, String) -> Boolean
const shouldPrintLog = (loggerLevel, logLevel) => gte(
    resolveLogLevelIndex(loggerLevel),
    resolveLogLevelIndex(logLevel),
)

// loggerHead :: String-> String
const loggerHead = type => `[${(new Date()).toISOString()}] ${type.toUpperCase()}:`

// error :: (String, Output) -> Function
const error = (level, output) => when(
    level => shouldPrintLog(level, LEVEL_ERROR),
    () => partial(
        bind(output.error, output),
        [loggerHead(LEVEL_ERROR)],
    ),
)(level)

// warn :: (String, Output) -> Function
const warn = (level, output) => when(
    level => shouldPrintLog(level, LEVEL_WARN),
    () => partial(
        bind(output.warn, output),
        [loggerHead(LEVEL_WARN)],
    ),
)(level)

// info :: (String, Output) -> Function
const info = (level, output) => when(
    level => shouldPrintLog(level, LEVEL_INFO),
    () => partial(
        bind(output.info, output),
        [loggerHead(LEVEL_INFO)],
    ),
)(level)

// debug :: (String, Output) -> Function
const debug = (level, output) => when(
    level => shouldPrintLog(level, LEVEL_DEBUG),
    () => partial(
        bind(output.log, output),
        [loggerHead(LEVEL_DEBUG)],
    ),
)(level)

export const formatException = e => JSON.stringify(pickAll(['code', 'message', 'stack'], e))

// createLogger :: (String, Output) -> Logger
export default (level, output) => ({
  error: error(level, output),
  info: info(level, output),
  debug: debug(level, output),
  warn: warn(level, output),
})
