import 'regenerator-runtime/runtime' // needed to be able to execute transpiled generator functions like async/await
import initApp from './app'
import initManager from './manager'
import initWorker from './worker'
import setupProcessHandlers from './processHandlers'

jest.mock('./manager')
jest.mock('./worker')
jest.mock('./processHandlers')

beforeEach(() => {
  initManager.mockClear()
  initWorker.mockClear()
  setupProcessHandlers.mockClear()
})

describe('app', () => {
  it(`initializes the app (manager + worker)`, () => {
    const configuration = {
      manager: {
        enabled: 1,
      },
      worker: {
        enabled: 1,
      },
    }
    const logger = {}
    const queue = {}

    initApp(configuration, {}, {})

    expect(initManager).toHaveBeenCalledTimes(1)
    expect(initManager).toHaveBeenCalledWith(configuration, logger, queue)
    expect(initWorker).toHaveBeenCalledTimes(1)
    expect(initWorker).toHaveBeenCalledWith(configuration, logger, queue)
    expect(setupProcessHandlers).toHaveBeenCalledTimes(1)
  })

  it(`initializes the app (manager only)`, () => {
    const configuration = {
      manager: {
        enabled: 1,
      },
      worker: {
        enabled: 0,
      },
    }
    const logger = {}
    const queue = {}

    initApp(configuration, {}, {})

    expect(initManager).toHaveBeenCalledTimes(1)
    expect(initManager).toHaveBeenCalledWith(configuration, logger, queue)
    expect(initWorker).toHaveBeenCalledTimes(0)
    expect(setupProcessHandlers).toHaveBeenCalledTimes(1)
  })

  it(`initializes the app (worker only)`, () => {
    const configuration = {
      manager: {
        enabled: 0,
      },
      worker: {
        enabled: 1,
      },
    }
    const logger = {}
    const queue = {}

    initApp(configuration, {}, {})

    expect(initManager).toHaveBeenCalledTimes(0)
    expect(initWorker).toHaveBeenCalledTimes(1)
    expect(initWorker).toHaveBeenCalledWith(configuration, logger, queue)
    expect(setupProcessHandlers).toHaveBeenCalledTimes(1)
  })
})
