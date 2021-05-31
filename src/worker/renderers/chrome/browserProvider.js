import kill from 'tree-kill'
import puppeteer from 'puppeteer-core'

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

// getBrowserProvider :: _ -> BrowserProvider
export default () => ({
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
    await this._instance.removeAllListeners()
    await this._instance.close()

    if (this._instance) {
      const browserProcess = this._instance.process()

      if (browserProcess && browserProcess.pid) {
        await kill(browserProcess.pid, 'SIGKILL')
      }
    }

    this._instance = null
  },
})
