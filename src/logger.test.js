import { LEVEL_DEBUG, LEVEL_ERROR, LEVEL_INFO, LEVEL_WARN, default as createLogger } from './logger'

describe('logger', () => {
  it(`creates a logger with DEBUG level`, () => {
    const debugMock = jest.fn()
    const infoMock = jest.fn()
    const warnMock = jest.fn()
    const errorMock = jest.fn()

    const outputMock = {
      log: debugMock,
      info: infoMock,
      warn: warnMock,
      error: errorMock,
    }

    const logger = createLogger(LEVEL_DEBUG, outputMock)

    logger.debug('debug log')
    logger.info('info log')
    logger.warn('warn log')
    logger.error('error log')

    expect(debugMock.mock.calls.length).toBe(1)
    expect(debugMock.mock.calls[0][0]).toMatch(/ DEBUG:$/)
    expect(debugMock.mock.calls[0][1]).toBe('debug log')
    expect(infoMock.mock.calls.length).toBe(1)
    expect(infoMock.mock.calls[0][0]).toMatch(/ INFO:$/)
    expect(infoMock.mock.calls[0][1]).toBe('info log')
    expect(warnMock.mock.calls.length).toBe(1)
    expect(warnMock.mock.calls[0][0]).toMatch(/ WARN:$/)
    expect(warnMock.mock.calls[0][1]).toBe('warn log')
    expect(errorMock.mock.calls.length).toBe(1)
    expect(errorMock.mock.calls[0][0]).toMatch(/ ERROR:$/)
    expect(errorMock.mock.calls[0][1]).toBe('error log')
  })

  it(`creates a logger with INFO level`, () => {
    const debugMock = jest.fn()
    const infoMock = jest.fn()
    const warnMock = jest.fn()
    const errorMock = jest.fn()

    const outputMock = {
      log: debugMock,
      info: infoMock,
      warn: warnMock,
      error: errorMock,
    }

    const logger = createLogger(LEVEL_INFO, outputMock)

    logger.debug('debug log')
    logger.info('info log')
    logger.warn('warn log')
    logger.error('error log')

    expect(debugMock.mock.calls.length).toBe(0)
    expect(infoMock.mock.calls.length).toBe(1)
    expect(infoMock.mock.calls[0][0]).toMatch(/ INFO:$/)
    expect(infoMock.mock.calls[0][1]).toBe('info log')
    expect(warnMock.mock.calls.length).toBe(1)
    expect(warnMock.mock.calls[0][0]).toMatch(/ WARN:$/)
    expect(warnMock.mock.calls[0][1]).toBe('warn log')
    expect(errorMock.mock.calls.length).toBe(1)
    expect(errorMock.mock.calls[0][0]).toMatch(/ ERROR:$/)
    expect(errorMock.mock.calls[0][1]).toBe('error log')
  })

  it(`creates a logger with WARN level`, () => {
    const debugMock = jest.fn()
    const infoMock = jest.fn()
    const warnMock = jest.fn()
    const errorMock = jest.fn()

    const outputMock = {
      log: debugMock,
      info: infoMock,
      warn: warnMock,
      error: errorMock,
    }

    const logger = createLogger(LEVEL_WARN, outputMock)

    logger.debug('debug log')
    logger.info('info log')
    logger.warn('warn log')
    logger.error('error log')

    expect(debugMock.mock.calls.length).toBe(0)
    expect(infoMock.mock.calls.length).toBe(0)
    expect(warnMock.mock.calls.length).toBe(1)
    expect(warnMock.mock.calls[0][0]).toMatch(/ WARN:$/)
    expect(warnMock.mock.calls[0][1]).toBe('warn log')
    expect(errorMock.mock.calls.length).toBe(1)
    expect(errorMock.mock.calls[0][0]).toMatch(/ ERROR:$/)
    expect(errorMock.mock.calls[0][1]).toBe('error log')
  })

  it(`creates a logger with ERROR level`, () => {
    const debugMock = jest.fn()
    const infoMock = jest.fn()
    const warnMock = jest.fn()
    const errorMock = jest.fn()

    const outputMock = {
      log: debugMock,
      info: infoMock,
      warn: warnMock,
      error: errorMock,
    }

    const logger = createLogger(LEVEL_ERROR, outputMock)

    logger.debug('debug log')
    logger.info('info log')
    logger.warn('warn log')
    logger.error('error log')

    expect(debugMock.mock.calls.length).toBe(0)
    expect(infoMock.mock.calls.length).toBe(0)
    expect(warnMock.mock.calls.length).toBe(0)
    expect(errorMock.mock.calls.length).toBe(1)
    expect(errorMock.mock.calls[0][0]).toMatch(/ ERROR:$/)
    expect(errorMock.mock.calls[0][1]).toBe('error log')
  })

  it(`creates a logger with an invalid level`, () => {
    const debugMock = jest.fn()
    const infoMock = jest.fn()
    const warnMock = jest.fn()
    const errorMock = jest.fn()

    const outputMock = {
      log: debugMock,
      info: infoMock,
      warn: warnMock,
      error: errorMock,
    }

    const logger = createLogger('invalid', outputMock)

    logger.debug('debug log')
    logger.info('info log')
    logger.warn('warn log')
    logger.error('error log')

    expect(debugMock.mock.calls.length).toBe(0)
    expect(infoMock.mock.calls.length).toBe(0)
    expect(warnMock.mock.calls.length).toBe(0)
    expect(errorMock.mock.calls.length).toBe(0)
  })
})
