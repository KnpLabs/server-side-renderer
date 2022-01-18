import createRequestRegistry from './requestRegistry'
import initHttpServer from './http-server'
import initManager from './initManager'

jest.mock('./requestRegistry', () => jest.fn(() => {}))
jest.mock('./http-server')

beforeEach(() => {
  createRequestRegistry.mockClear()
  initHttpServer.mockClear()
})

describe('manager :: initManager', () => {
  it(`initializes a manager`, async () => {
    const configuration = {
      manager: {
        http_server: {
          port: 8080,
          host: '0.0.0.0',
        },
      },
    }

    const loggerMock = {
      debug: () => {},
    }

    const queueMock = {
      on: jest.fn(),
      close: jest.fn(),
    }

    const httpServerMock = {
      close: jest.fn(),
    }
    initHttpServer.mockImplementationOnce(() => httpServerMock)

    const gracefulShutdownManagerFunction = initManager(configuration, loggerMock, queueMock)

    expect(gracefulShutdownManagerFunction).toEqual(expect.any(Function))
    expect(queueMock.on).toHaveBeenCalledTimes(2)
    expect(queueMock.on).toHaveBeenNthCalledWith(1, 'global:completed', expect.any(Function))
    expect(queueMock.on).toHaveBeenNthCalledWith(2, 'global:failed', expect.any(Function))
    expect(initHttpServer).toHaveBeenCalledTimes(1)

    expect(queueMock.close).toHaveBeenCalledTimes(0)
    expect(httpServerMock.close).toHaveBeenCalledTimes(0)

    await gracefulShutdownManagerFunction()

    expect(queueMock.close).toHaveBeenCalledTimes(1)
    expect(httpServerMock.close).toHaveBeenCalledTimes(1)
  })
})
