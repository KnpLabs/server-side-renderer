import { POST_RENDER_SCRIPT_KEY } from '../../scriptProvider'
import browserRequestHandler from './browserRequestHandler'
import { formatException } from './../../../logger'
import getBrowserProvider from './browserProvider'

// renderPageContent :: (Configuration, Logger, ScriptProvier, BrowserInstance, String) -> RenderedPage
const renderPageContent = async (configuration, logger, scriptProvider, browserInstance, url) => {
  const page = await browserInstance.newPage()

  await page.setRequestInterception(true)

  page.on('request', browserRequestHandler(configuration, logger))
  page.on('error', error => logger.error(formatException(error)))
  page.on('pageerror', error => logger.error(formatException(error)))
  page.on('requestfailed', req => logger.debug(`Browser request failed. ${req.url()}. ${req.failure().errorText}`))
  // See https://github.com/puppeteer/puppeteer/issues/3397
  page.on('console', async msg => {
    const level = `CONSOLE.${msg.type()}`

    try {
      if (msg.text() !== 'JSHandle@error') {
        logger.debug(`${level}: ${msg.text()}`)
        return
      }

      const args = msg.args()

      const extracted = await Promise.all(args.map(async handle => {
        try {
          const messageHandle = await handle.getProperty('message')
          const message = await messageHandle.jsonValue().catch(() => null)
          await messageHandle.dispose()

          if (message) return String(message)

          const stackHandle = await handle.getProperty('stack')
          const stack = await stackHandle.jsonValue().catch(() => null)
          await stackHandle.dispose()

          if (stack) return String(stack)

          return handle.toString()
        } finally {
          await handle.dispose().catch(() => {})
        }
      }))

      logger.debug(`${level}: ${extracted.filter(Boolean).join(', ')}`)
    } catch (e) {
      logger.debug(`${level}: (failed to parse console message) ${String(e?.message || e)}`)
    }
  })

  await page.goto(url, {
    waitUntil: 'networkidle0',
    timeout: configuration.worker.renderer.timeout,
  })

  await page.evaluate(scriptProvider.get(POST_RENDER_SCRIPT_KEY))

  return await page.content()
}

// render :: (Configuration, Logger, ScriptProvider) -> String
export default (configuration, logger, scriptProvider) => async url => {
  const browserProvider = getBrowserProvider(configuration, logger)
  const browserInstance = await browserProvider.getInstance()

  try {
    return await renderPageContent(configuration, logger, scriptProvider, browserInstance, url)
  } catch (error) {
    logger.error(
      `An error occurred while rendering the url "${url}".`,
      formatException(error),
    )

    throw error
  } finally {
    browserProvider.cleanup()
  }
}
