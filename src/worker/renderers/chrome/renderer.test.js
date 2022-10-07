import browserRequestHandler from './browserRequestHandler'
import getBrowserProvider from './browserProvider'
import render from './renderer'

jest.mock('./browserRequestHandler', () => jest.fn().mockImplementation(() => () => {}))
jest.mock('./browserProvider')

beforeEach(() => {
  browserRequestHandler.mockClear()
  getBrowserProvider.mockClear()
})

describe('worker :: renderer', () => {
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

    const postRenderScriptMock = () => {}
    const scriptProviderMock = {
      get: jest.fn(() => postRenderScriptMock),
    }

    const browserCleanupMock = jest.fn()

    const pageMock = {
      setRequestInterception: jest.fn(),
      on: jest.fn(),
      goto: jest.fn(),
      content: jest.fn(() => Promise.resolve('My page content')),
      evaluate: jest.fn(),
    }

    getBrowserProvider.mockReturnValueOnce(({
      getInstance: () => Promise.resolve({
        newPage: () => Promise.resolve(pageMock),
      }),
      cleanup: browserCleanupMock,
    }))

    expect(await render(configuration, {}, scriptProviderMock)('https://nginx/dynamic.html')).toBe('My page content')
    expect(scriptProviderMock.get).toHaveBeenCalledTimes(1)
    expect(scriptProviderMock.get).toHaveBeenNthCalledWith(1, 'postRender')
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
    expect(pageMock.evaluate).toHaveBeenCalledTimes(1)
    expect(pageMock.evaluate).toHaveBeenNthCalledWith(1, postRenderScriptMock)
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
