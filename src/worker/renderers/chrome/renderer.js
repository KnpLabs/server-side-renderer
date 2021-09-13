import { POST_RENDER_SCRIPT_KEY } from '../../scriptProvider'
import browserRequestHandler from './browserRequestHandler'
import { formatException } from './../../../logger'
import getBrowserProvider from './browserProvider'
import { reduce } from 'ramda'

// renderPageContent :: (Configuration, Logger, ScriptProvier, BrowserInstance, String) -> RenderedPage
const renderPageContent = async (configuration, logger, scriptProvider, browserInstance, url) => {
  const page = await browserInstance.newPage()

  await page.setRequestInterception(true)

  page.on('request', browserRequestHandler(configuration, logger))
  page.on('error', error => logger.error(formatException(error)))
  page.on('pageerror', error => logger.error(formatException(error)))
  page.on('requestfailed', req => logger.debug(`Browser request failed. ${req.url()}. ${req.failure().errorText}`))
  // See https://github.com/puppeteer/puppeteer/issues/3397#issuecomment-434970058
  page.on('console', async msg => {
    const args = await Promise.all(msg.args().map(
      jsHandle => jsHandle.executionContext().evaluate(arg => {
        if (arg instanceof Error) {
          return arg.message
        }

        return arg
      }),
    ))
    const text = reduce((acc, cur) => acc += acc !== '' ? `, ${cur}` : cur, '', args)

    logger.debug(`CONSOLE.${msg.type()}: ${msg.text()}\n${text}`)
  })

  await page.goto(url, {
    waitUntil: 'networkidle0',
    timeout: configuration.worker.renderer.timeout,
  })

  await page.exposeFunction('postRender', scriptProvider.get(POST_RENDER_SCRIPT_KEY))
  await page.evaluate(`(async () => {
    await window.postRender();
  })()`)

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
