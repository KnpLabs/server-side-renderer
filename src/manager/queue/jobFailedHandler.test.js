import jobFailedHandler from './jobFailedHandler'

describe('manager :: queue :: jobFailedHandler', () => {
  it(`completes an unsuccessful job`, async () => {
    const loggerMock = {
      error: () => {},
    }

    const jobMock = {
      data: {
        queuedAt: Date.now() - 1000,
      },
      remove: jest.fn(),
    }

    const queueMock = {
      getJob: jest.fn(() => Promise.resolve(jobMock)),
    }

    const requestRegistryMock = {
      has: jest.fn(() => true),
      fail: jest.fn(),
    }

    await jobFailedHandler(loggerMock, queueMock, requestRegistryMock)('job-id', 'job-error')

    expect(requestRegistryMock.has).toHaveBeenCalledTimes(1)
    expect(requestRegistryMock.has).toHaveBeenCalledWith('job-id')
    expect(requestRegistryMock.fail).toHaveBeenCalledTimes(1)
    expect(requestRegistryMock.fail).toHaveBeenCalledWith('job-id', 500)
    expect(queueMock.getJob).toHaveBeenCalledTimes(1)
    expect(queueMock.getJob).toHaveBeenCalledWith('job-id')
    expect(jobMock.remove).toHaveBeenCalledTimes(1)
  })

  it(`completes a timed out job`, async () => {
    const loggerMock = {
      error: () => {},
    }

    const jobMock = {
      data: {
        queuedAt: Date.now() - 1000,
      },
      remove: jest.fn(),
    }

    const queueMock = {
      getJob: jest.fn(() => Promise.resolve(jobMock)),
    }

    const requestRegistryMock = {
      has: jest.fn(() => true),
      fail: jest.fn(),
    }

    await jobFailedHandler(loggerMock, queueMock, requestRegistryMock)('job-id', 'job-timeout-error')

    expect(requestRegistryMock.has).toHaveBeenCalledTimes(1)
    expect(requestRegistryMock.has).toHaveBeenCalledWith('job-id')
    expect(requestRegistryMock.fail).toHaveBeenCalledTimes(1)
    expect(requestRegistryMock.fail).toHaveBeenCalledWith('job-id', 504)
    expect(queueMock.getJob).toHaveBeenCalledTimes(1)
    expect(queueMock.getJob).toHaveBeenCalledWith('job-id')
    expect(jobMock.remove).toHaveBeenCalledTimes(1)
  })

  it(`skips an unsuccessful job completion if it's not present in the request queue`, () => {
    const requestRegistryMock = {
      has: jest.fn(() => false),
      fail: jest.fn(),
    }

    jobFailedHandler({}, {}, requestRegistryMock)('job-id', 'job-error')

    expect(requestRegistryMock.has).toHaveBeenCalledTimes(1)
    expect(requestRegistryMock.has).toHaveBeenCalledWith('job-id')
    expect(requestRegistryMock.fail).toHaveBeenCalledTimes(0)
  })
})
