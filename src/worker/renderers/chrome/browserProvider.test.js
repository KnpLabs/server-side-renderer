import 'regenerator-runtime/runtime' // needed to be able to execute transpiled generator functions like async/await
import getBrowserProvider from './browserProvider'
import { launch } from 'puppeteer-core'
import treekill from 'tree-kill'

jest.mock('puppeteer-core', () => ({
  launch: jest.fn(() => Promise.resolve({
    removeAllListeners: jest.fn(),
    close: jest.fn(),
    process: jest.fn(),
  })),
}))

jest.mock('tree-kill')

beforeEach(() => {
  launch.mockClear()
  treekill.mockClear()
})

describe('worker :: renderer :: browserProvider', () => {
  it(`returns a browser instance`, () => {
    const browserProvider = getBrowserProvider()

    expect(browserProvider.getInstance()) // eslint-disable-line jest/valid-expect
      .resolves.toMatchObject({
        removeAllListeners: expect.any(Function),
        close: expect.any(Function),
        process: expect.any(Function),
      })
    expect(launch).toHaveBeenCalledTimes(1)
    expect(launch).toHaveBeenCalledWith({
      'args': [
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-setuid-sandbox',
        '--disable-software-rasterizer',
        '--headless',
        '--no-sandbox',
        '--safebrowsing-disable-auto-update',
        '--use-gl=disabled',
      ],
      'defaultViewport': null,
      'executablePath': '/usr/bin/google-chrome-stable',
    })
  })

  it(`returns the same browser instance when called multiple times`, async () => {
    const browserProvider = getBrowserProvider()

    await browserProvider.getInstance()
    await browserProvider.getInstance()
    await browserProvider.getInstance()

    expect(launch).toHaveBeenCalledTimes(1)
    expect(launch).toHaveBeenCalledWith({
      'args': [
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-setuid-sandbox',
        '--disable-software-rasterizer',
        '--headless',
        '--no-sandbox',
        '--safebrowsing-disable-auto-update',
        '--use-gl=disabled',
      ],
      'defaultViewport': null,
      'executablePath': '/usr/bin/google-chrome-stable',
    })
  })

  it(`closes the browser instance`, async () => {
    const browserProvider = getBrowserProvider()

    const browser = await browserProvider.getInstance()
    await browserProvider.cleanup()

    expect(browserProvider._instance).toBe(null)
    expect(browser.removeAllListeners).toHaveBeenCalledTimes(1)
    expect(browser.close).toHaveBeenCalledTimes(1)
    expect(browser.process).toHaveBeenCalledTimes(1)
    expect(treekill).toHaveBeenCalledTimes(0)
  })

  it(`forcefully closes the browser instance`, async () => {
    const browserProvider = getBrowserProvider()

    const browser = await browserProvider.getInstance()
    browser.process.mockReturnValueOnce({ pid: 10 })

    await browserProvider.cleanup()

    expect(browserProvider._instance).toBe(null)
    expect(browser.removeAllListeners).toHaveBeenCalledTimes(1)
    expect(browser.close).toHaveBeenCalledTimes(1)
    expect(browser.process).toHaveBeenCalledTimes(1)
    expect(treekill).toHaveBeenCalledTimes(1)
  })
})
