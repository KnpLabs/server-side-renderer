import { T, anyPass, complement, cond, equals, find, isNil, pipe, test } from 'ramda'
import { formatException } from './../../logger'
import puppeteer from 'puppeteer'
import treekill from 'tree-kill'

const spawnBrowser = async () => await puppeteer.launch({
  args: [
    // @todo check on these parameters
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-setuid-sandbox',
    '--disable-software-rasterizer',
    '--headless',
    '--no-sandbox',
    '--safebrowsing-disable-auto-update',
    '--use-gl=disabled',
    '--single-process',
  ],
  defaultViewport: null,
})

const resolveRequestDomain = req => req.url().match(/^(https?:\/\/)?(?<host>[^/]+)/).groups.host

const isMatchingDomain = input => anyPass([
  equals('*'),
  value => test(new RegExp(`${value}$`, 'i'), input),
])

const isRequestDomainAuthorized = authorizedRequestDomains => pipe(
  resolveRequestDomain,
  domain => find(isMatchingDomain(domain), authorizedRequestDomains),
  complement(isNil),
)

const isMatchingResourceType = input => anyPass([
  equals('*'),
  equals(input),
])

const isRequestResourceAuthorized = authorizedRequestResources => pipe(
  req => req.resourceType(),
  resourceType => find(isMatchingResourceType(resourceType), authorizedRequestResources),
  complement(isNil),
)

const allowRequest = req => req.continue()

const blockRequest = (logger, reason) => req => logger.debug(`Abort request ${req.url()} because of non authorized ${reason}.`) || req.abort()

const renderPageContent = async (configuration, logger, browser, url) => {
  const page = await browser.newPage()

  await page.setRequestInterception(true)
  page.on('request', cond([
    [
      complement(isRequestDomainAuthorized(configuration.worker.renderer.authorized_request_domains)), 
      blockRequest(logger, 'domain'),
    ],
    [
      complement(isRequestResourceAuthorized(configuration.worker.renderer.authorized_request_resources)), 
      blockRequest(logger, 'resource type'),
    ],
    // @todo add request redirection
    [T, allowRequest],
  ]))

  await page.goto(url, {
    waitUntil: 'networkidle0',
  })

  return await page.content()
}

const cleanup = async browser => {
  await browser.removeAllListeners()
  await browser.close()

  // @todo check why these lines makes the app crash
  if (browser && null !== browser.process()) {
    treekill(browser.process().pid, 'SIGKILL')
  }
}

export default (configuration, logger) => async url => {
  const browser = await spawnBrowser()

  try {
    return await renderPageContent(configuration, logger, browser, url)
  } catch (error) {
    logger.error(
      `An error occurred while rendering the url "${url}".`,
      formatException(error),
    )
  } finally {
    cleanup(browser)
  }
}
