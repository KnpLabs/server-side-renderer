import { apply, map, pipe } from 'ramda'
import browserRequestHandler from './browserRequestHandler'
import { formatException } from './../../../logger'
import getBrowserProvider from './browserProvider'

// renderPageContent :: (Configuration, Logger, BrowserInstance, String) -> RenderedPage
const renderPageContent = async (configuration, logger, browserInstance, url) => {
  const page = await browserInstance.newPage()

  await page.setRequestInterception(true)

  page.on('request', browserRequestHandler(configuration, logger))
  page.on('error', error => logger.error(formatException(error)))
  page.on('pageerror', error => logger.error(formatException(error)))
  page.on('requestfailed', req => logger.debug(`Browser request failed. ${req.url()}.`))
  page.on('console', pipe(
    msg => msg.args(),
    map(arg => arg.toString()),
    apply(logger.debug),
  ))

  await page.goto(url, {
    waitUntil: 'networkidle0',
    timeout: configuration.queue.job.timeout,
  })

  return await page.content()
}

// render :: (Configuration, Logger) -> String
export default (configuration, logger) => async url => {
  const browserProvider = getBrowserProvider()
  const browserInstance = await browserProvider.getInstance()

  try {
    return await renderPageContent(configuration, logger, browserInstance, url)
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
