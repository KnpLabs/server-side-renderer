import browserRequestHandler from './browserRequestHandler'
import { formatException } from './../../../logger'
import fs from 'fs'
import getBrowserProvider from './browserProvider'
import path from 'path'
import { reduce } from 'ramda'
import vm from 'vm'

const POST_RENDER_SCRIPT_PATH = path.join(process.cwd(), 'scripts/postRender.js')

const resolvePostRenderFunction = () => {
  const context = { postRenderFunction: () => {} }

  const fileStats = fs.statSync(POST_RENDER_SCRIPT_PATH, { throwIfNoEntry: false })
  if (fileStats && fileStats.isFile()) {
    const script = new vm.Script(
      fs.readFileSync(
        POST_RENDER_SCRIPT_PATH,
        { encoding: 'utf8', flag: 'r' },
      ),
    )

    vm.createContext(context)
    script.runInContext(context)
  }

  return context.postRenderFunction
}

// renderPageContent :: (Configuration, Logger, BrowserInstance, String) -> RenderedPage
const renderPageContent = async (configuration, logger, browserInstance, url) => {
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

  await page.evaluate(resolvePostRenderFunction())

  return await page.content()
}

// render :: (Configuration, Logger) -> String
export default (configuration, logger) => async url => {
  const browserProvider = getBrowserProvider(configuration, logger)
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
