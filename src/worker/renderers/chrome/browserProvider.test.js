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

const flushPromises = () => new Promise(resolve => setImmediate(resolve))

beforeEach(() => {
  launch.mockClear()
  treekill.mockClear()
  treekill.mockImplementation((pid, signal, callback) => callback())
})

describe('worker :: renderer :: browserProvider', () => {
  it(`returns a browser instance`, () => {
    const configuration = {
      worker: {
        renderer: {
          chrome: {
            options: [
              '--disable-dev-shm-usage',
              '--disable-gpu',
              '--disable-setuid-sandbox',
              '--disable-software-rasterizer',
              '--headless',
              '--no-sandbox',
              '--safebrowsing-disable-auto-update',
              '--use-gl=disabled',
            ],
          },
        },
      },
    }
    const browserProvider = getBrowserProvider(configuration)

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
    const configuration = {
      worker: {
        renderer: {
          chrome: {
            options: [
              '--disable-dev-shm-usage',
              '--disable-gpu',
              '--disable-setuid-sandbox',
              '--disable-software-rasterizer',
              '--headless',
              '--no-sandbox',
              '--safebrowsing-disable-auto-update',
              '--use-gl=disabled',
            ],
          },
        },
      },
    }
    const browserProvider = getBrowserProvider(configuration)

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
    const configuration = {
      worker: {
        renderer: {
          chrome: {
            options: [
              '--disable-dev-shm-usage',
              '--disable-gpu',
              '--disable-setuid-sandbox',
              '--disable-software-rasterizer',
              '--headless',
              '--no-sandbox',
              '--safebrowsing-disable-auto-update',
              '--use-gl=disabled',
            ],
          },
        },
      },
    }
    const browserProvider = getBrowserProvider(configuration)

    const browser = await browserProvider.getInstance()
    await browserProvider.cleanup()

    expect(browserProvider._instance).toBe(null)
    expect(browser.removeAllListeners).toHaveBeenCalledTimes(1)
    expect(browser.close).toHaveBeenCalledTimes(1)
    expect(browser.process).toHaveBeenCalledTimes(1)
    expect(treekill).toHaveBeenCalledTimes(0)
  })

  it(`forcefully closes the browser instance`, async () => {
    const configuration = {
      worker: {
        renderer: {
          chrome: {
            options: [
              '--disable-dev-shm-usage',
              '--disable-gpu',
              '--disable-setuid-sandbox',
              '--disable-software-rasterizer',
              '--headless',
              '--no-sandbox',
              '--safebrowsing-disable-auto-update',
              '--use-gl=disabled',
            ],
          },
        },
      },
    }
    const browserProvider = getBrowserProvider(configuration)

    const browser = await browserProvider.getInstance()
    browser.process.mockReturnValueOnce({ pid: 10, exitCode: null, signalCode: null })

    await browserProvider.cleanup()

    expect(browserProvider._instance).toBe(null)
    expect(browser.removeAllListeners).toHaveBeenCalledTimes(1)
    expect(browser.close).toHaveBeenCalledTimes(1)
    expect(browser.process).toHaveBeenCalledTimes(1)
    expect(treekill).toHaveBeenCalledTimes(1)
    expect(treekill).toHaveBeenCalledWith(10, 'SIGKILL', expect.any(Function))
  })

  it(`waits for tree-kill to finish before completing cleanup`, async () => {
    const configuration = {
      worker: {
        renderer: {
          chrome: {
            options: [
              '--disable-dev-shm-usage',
              '--disable-gpu',
              '--disable-setuid-sandbox',
              '--disable-software-rasterizer',
              '--headless',
              '--no-sandbox',
              '--safebrowsing-disable-auto-update',
              '--use-gl=disabled',
            ],
          },
        },
      },
    }
    const browserProvider = getBrowserProvider(configuration)
    let killCallback

    treekill.mockImplementationOnce((pid, signal, callback) => {
      killCallback = callback
    })

    const browser = await browserProvider.getInstance()
    browser.process.mockReturnValueOnce({ pid: 10, exitCode: null, signalCode: null })

    const cleanupPromise = browserProvider.cleanup()
    let cleanupFinished = false
    cleanupPromise.then(() => {
      cleanupFinished = true
    })

    await flushPromises()

    expect(treekill).toHaveBeenCalledTimes(1)
    expect(cleanupFinished).toBe(false)

    killCallback()
    await cleanupPromise

    expect(cleanupFinished).toBe(true)
    expect(browserProvider._instance).toBe(null)
  })

  it(`cleanup is a no-op when the browser was never started`, async () => {
    const configuration = {
      worker: {
        renderer: {
          chrome: {
            options: [],
          },
        },
      },
    }
    const browserProvider = getBrowserProvider(configuration)

    await browserProvider.cleanup()

    expect(launch).not.toHaveBeenCalled()
    expect(browserProvider._instance).toBe(null)
  })

  it(`does not close the browser twice when cleanup is called sequentially`, async () => {
    const configuration = {
      worker: {
        renderer: {
          chrome: {
            options: [],
          },
        },
      },
    }
    const browserProvider = getBrowserProvider(configuration)

    const browser = await browserProvider.getInstance()

    await browserProvider.cleanup()
    await browserProvider.cleanup()

    expect(browser.close).toHaveBeenCalledTimes(1)
    expect(browserProvider._instance).toBe(null)
  })

  it(`concurrent cleanup calls share the same cleanup promise`, async () => {
    const configuration = {
      worker: {
        renderer: {
          chrome: {
            options: [],
          },
        },
      },
    }
    const browserProvider = getBrowserProvider(configuration)

    const browser = await browserProvider.getInstance()

    await Promise.all([
      browserProvider.cleanup(),
      browserProvider.cleanup(),
    ])

    expect(browser.close).toHaveBeenCalledTimes(1)
    expect(browserProvider._instance).toBe(null)
  })

  it(`getInstance waits for an in-progress cleanup before launching a new browser`, async () => {
    const configuration = {
      worker: {
        renderer: {
          chrome: {
            options: [],
          },
        },
      },
    }
    const browserProvider = getBrowserProvider(configuration)
    let killCallback

    treekill.mockImplementationOnce((pid, signal, callback) => {
      killCallback = callback
    })

    const browser = await browserProvider.getInstance()
    browser.process.mockReturnValueOnce({ pid: 10, exitCode: null, signalCode: null })

    const cleanupPromise = browserProvider.cleanup()
    const instancePromise = browserProvider.getInstance()

    await flushPromises()

    expect(launch).toHaveBeenCalledTimes(1)

    killCallback()
    await cleanupPromise
    await instancePromise

    expect(launch).toHaveBeenCalledTimes(2)
  })
})
