import 'regenerator-runtime/runtime' // needed to be able to execute transpiled generator functions like async/await
import jobCompletedHandler from './jobCompletedHandler'

describe('manager :: queue :: jobCompletedHandler', () => {
  it(`completes a job`, async () => {
    const loggerMock = {
      info: () => {},
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
      complete: jest.fn(),
    }

    await jobCompletedHandler(loggerMock, queueMock, requestRegistryMock)('job-id', '"job-result"')

    expect(requestRegistryMock.has).toHaveBeenCalledTimes(1)
    expect(requestRegistryMock.has).toHaveBeenCalledWith('job-id')
    expect(requestRegistryMock.complete).toHaveBeenCalledTimes(1)
    expect(requestRegistryMock.complete).toHaveBeenCalledWith('job-id', 'job-result')
    expect(queueMock.getJob).toHaveBeenCalledTimes(1)
    expect(queueMock.getJob).toHaveBeenCalledWith('job-id')
    expect(jobMock.remove).toHaveBeenCalledTimes(1)
  })

  it(`skips a job completion if it's not present in the request queue`, () => {
    const requestRegistryMock = {
      has: jest.fn(() => false),
      complete: jest.fn(),
    }

    jobCompletedHandler({}, {}, requestRegistryMock)('job-id', 'job-result')

    expect(requestRegistryMock.has).toHaveBeenCalledTimes(1)
    expect(requestRegistryMock.has).toHaveBeenCalledWith('job-id')
    expect(requestRegistryMock.complete).toHaveBeenCalledTimes(0)
  })
})
