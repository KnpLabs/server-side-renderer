import 'regenerator-runtime/runtime' // needed to be able to execute transpiled generator functions like async/await
import processHandler from './processHandler'
import render from '../renderers/chrome'

jest.mock('../renderers/chrome')

beforeEach(() => {
  render.mockClear()
})

describe('worker :: queue :: processHandler', () => {
  it(`processes a job`, () => {
    const configuration = {
      queue: {
        job: {
          stale_timeout: 10000,
        },
      },
    }

    const rendererMock = jest.fn(() => Promise.resolve('My content'))
    render.mockImplementationOnce(() => rendererMock)

    const loggerMock = {
      debug: () => {},
    }

    const jobMock = {
      id: 'my-job-id',
      data: {
        queuedAt: Date.now(),
        url: 'http://nginx/dynamic.html',
      },
    }

    expect(processHandler(configuration, loggerMock)(jobMock))  // eslint-disable-line jest/valid-expect
      .resolves.toBe('My content')
    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith(configuration, loggerMock)
    expect(rendererMock).toHaveBeenCalledTimes(1)
    expect(rendererMock).toHaveBeenCalledWith('http://nginx/dynamic.html')
  })

  it(`throws an exception when the job is expired`, () => {
    const configuration = {
      queue: {
        job: {
          stale_timeout: 10000,
        },
      },
    }

    const jobMock = {
      id: 'my-job-id',
      data: {
        queuedAt: Date.now() - 20000,
        url: 'http://nginx/dynamic.html',
      },
    }

    expect(processHandler(configuration, {})(jobMock)) // eslint-disable-line jest/valid-expect
      .rejects.toEqual(
        new Error('Job "my-job-id" with url "http://nginx/dynamic.html" timed out."'),
      )
    expect(render).toHaveBeenCalledTimes(0)
  })
})
