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

const BROWSER_ARGS = [
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--disable-setuid-sandbox',
  '--disable-software-rasterizer',
  '--headless',
  '--no-sandbox',
  '--safebrowsing-disable-auto-update',
  '--use-gl=disabled',
]

// getBrowserProvider :: Logger -> BrowserProvider
export default logger => ({
  _logger: logger,
  _instance: null,

  getInstance: async function () {
    if (null === this._instance) {
      this._instance = await puppeteer.launch({
        // See https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions for available options
        // See https://peter.sh/experiments/chromium-command-line-switches for available args
        args: BROWSER_ARGS,
        executablePath: '/usr/bin/google-chrome-stable',
        defaultViewport: null,
      })
    }

    return this._instance
  },

  cleanup: async function () {
    try {
      await this._instance.close()
      await this._instance.removeAllListeners()
    } catch (error) {
      this._logger.error(`An error occurred while closing the browser. ${error.message}`)
    } finally {
      if (this._instance) {
        const browserProcess = this._instance.process()

        if (browserProcess && browserProcess.pid) {
          await treekill(browserProcess.pid, 'SIGKILL')
        }
      }

      this._instance = null
    }
  },
})
