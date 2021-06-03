import 'regenerator-runtime/runtime' // needed by the SSR to be able to execute transpiled generator functions like async/await
import render from './renderer'
import browserRequestHandler from './browserRequestHandler'
import getBrowserProvider from './browserProvider'

jest.mock('./browserRequestHandler', () => jest.fn().mockImplementation(() => () => {}))
jest.mock('./browserProvider')

beforeEach(() => {
  browserRequestHandler.mockClear()
  getBrowserProvider.mockClear()
})

describe('renderer', () => {
  it(`renders a page`, async () => {
    const configuration = {
      worker: {
        renderer: {
          timeout: 20000,
          authorized_request_domains: [
            '*',
          ],
          authorized_request_resources: [
            '*',
          ],
          redirections: [],
        },
      },
    }

    const browserCleanupMock = jest.fn()

    const pageMock = {
      setRequestInterception: jest.fn(),
      on: jest.fn(),
      goto: jest.fn(),
      content: jest.fn(() => Promise.resolve('My page content')),
    }

    getBrowserProvider.mockReturnValueOnce(({
      getInstance: () => Promise.resolve({
        newPage: () => Promise.resolve(pageMock),
      }),
      cleanup: browserCleanupMock,
    }))

    expect(await render(configuration, {})('https://nginx/dynamic.html')).toBe('My page content')
    expect(pageMock.setRequestInterception).toHaveBeenCalledTimes(1)
    expect(pageMock.setRequestInterception).toHaveBeenCalledWith(true)
    expect(pageMock.on).toHaveBeenCalledTimes(5)
    expect(pageMock.on).toHaveBeenNthCalledWith(1, 'request', expect.any(Function))
    expect(pageMock.on).toHaveBeenNthCalledWith(2, 'error', expect.any(Function))
    expect(pageMock.on).toHaveBeenNthCalledWith(3, 'pageerror', expect.any(Function))
    expect(pageMock.on).toHaveBeenNthCalledWith(4, 'requestfailed', expect.any(Function))
    expect(pageMock.on).toHaveBeenNthCalledWith(5, 'console', expect.any(Function))
    expect(pageMock.goto).toHaveBeenCalledTimes(1)
    expect(pageMock.goto).toHaveBeenCalledWith('https://nginx/dynamic.html', {
      waitUntil: 'networkidle0',
      timeout: 20000,
    })
    expect(browserCleanupMock).toHaveBeenCalledTimes(1)
  })

  it(`throws an expection when an error occurs`, async () => {
    const configuration = {
      worker: {
        renderer: {
          timeout: 20000,
          authorized_request_domains: [
            '*',
          ],
          authorized_request_resources: [
            '*',
          ],
          redirections: [],
        },
      },
    }

    const loggerMock = {
      error: () => {},
    }

    const browserCleanupMock = jest.fn()

    getBrowserProvider.mockReturnValueOnce(({
      getInstance: () => Promise.resolve({
        newPage: jest.fn().mockRejectedValue(new Error('My error')),
      }),
      cleanup: browserCleanupMock,
    }))

    await expect(render(configuration, loggerMock)('https://nginx/dynamic.html')).rejects.toEqual(new Error('My error'))
    expect(browserCleanupMock).toHaveBeenCalledTimes(1)
  })
})
