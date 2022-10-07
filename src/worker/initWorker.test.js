import initWorker from './initWorker'

describe('worker :: initWorker', () => {
  it(`initializes a worker`, async () => {
    const configuration = {}
    const loggerMock = {
      debug: () => {},
    }
    const queueMock = {
      process: jest.fn(),
      close: jest.fn(),
    }

    const gracefulShutdownWorkerFunction = initWorker(configuration, loggerMock, queueMock)

    expect(gracefulShutdownWorkerFunction).toEqual(expect.any(Function))
    expect(queueMock.process).toHaveBeenCalledTimes(1)
    expect(queueMock.process).toHaveBeenCalledWith(1, expect.any(Function))

    expect(queueMock.close).toHaveBeenCalledTimes(0)

    await gracefulShutdownWorkerFunction()

    expect(queueMock.close).toHaveBeenCalledTimes(1)
  })
})
