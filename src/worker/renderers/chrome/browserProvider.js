import puppeteer from 'puppeteer-core'
import treekill from 'tree-kill'

/**
 * @type BrowserProvider = {
 *     getInstance() :: () -> Puppeteer.Browser,
 *     cleanupInstance :: () -> _,
 * }
 *
 * @type BrowserInstance = Puppeteer.Browser
 */

const isProcessRunning = browserProcess =>
  browserProcess
  && browserProcess.pid
  && browserProcess.exitCode === null
  && browserProcess.signalCode === null

const killProcess = browserProcess => new Promise((resolve, reject) => {
  if (!isProcessRunning(browserProcess)) {
    resolve()
    return
  }

  treekill(browserProcess.pid, 'SIGKILL', error => {
    if (error) {
      reject(error)
      return
    }

    resolve()
  })
})

const logCleanupError = (logger, message, error) => {
  if (logger) {
    logger.error(`${message} ${error?.message ?? String(error)}`)
  }
}

// getBrowserProvider :: (Configuration, Logger) -> BrowserProvider
export default (configuration, logger) => ({
  _logger: logger,
  _instance: null,
  _cleanup: null,

  getInstance: async function () {
    if (this._cleanup) {
      await this._cleanup
    }

    if (null === this._instance) {
      this._instance = await puppeteer.launch({
        // See https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions for available options
        // See https://peter.sh/experiments/chromium-command-line-switches for available args
        args: configuration.worker.renderer.chrome.options,
        executablePath: '/usr/bin/google-chrome-stable',
        defaultViewport: null,
      })
    }

    return this._instance
  },

  cleanup: async function () {
    if (this._cleanup) {
      await this._cleanup
      return
    }

    const browser = this._instance

    if (null === browser) {
      return
    }

    this._cleanup = (async () => {
      const browserProcess = browser.process()

      try {
        await browser.close()
      } catch (error) {
        logCleanupError(this._logger, 'An error occurred while closing the browser.', error)
      }

      try {
        browser.removeAllListeners()
      } catch (error) {
        logCleanupError(this._logger, 'An error occurred while removing browser listeners.', error)
      }

      try {
        await killProcess(browserProcess)
      } catch (error) {
        logCleanupError(this._logger, 'An error occurred while killing the browser process.', error)
      } finally {
        if (this._instance === browser) {
          this._instance = null
        }
      }
    })()

    try {
      await this._cleanup
    } finally {
      this._cleanup = null
    }
  },
})
