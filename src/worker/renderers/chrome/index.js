import { __, T, anyPass, complement, cond, equals, find, isNil, pipe, test } from 'ramda'
import { formatException } from './../../../logger'
import getBrowserProvider from './browserProvider'

// resolveRequestDomain :: Request -> String
const resolveRequestDomain = req => req.url().match(/^(https?:\/\/)?(?<host>[^/]+)/).groups.host

// isMatchingDomain :: String -> String -> Boolean
const isMatchingDomain = input => anyPass([
    equals('*'),
    value => test(new RegExp(`${value}$`, 'i'), input),
])

// isRequestDomainAuthorized :: [String] -> Request -> Boolean
const isRequestDomainAuthorized = authorizedRequestDomains => pipe(
    resolveRequestDomain,
    domain => find(isMatchingDomain(domain), authorizedRequestDomains),
    complement(isNil),
)

// isMatchingResourceType :: String -> String -> Boolean
const isMatchingResourceType = input => anyPass([
    equals('*'),
    equals(input),
])

// isRequestResourceAuthorized :: [String] -> Request -> Boolean
const isRequestResourceAuthorized = authorizedRequestResources => pipe(
    req => req.resourceType(),
    resourceType => find(isMatchingResourceType(resourceType), authorizedRequestResources),
    complement(isNil),
)

// allowRequest :: Request -> _
const allowRequest = req => req.continue()

// blockRequest :: (Logger, String) -> Request -> _
const blockRequest = (logger, reason) => req => logger.debug(`Abort request ${req.url()} because of non authorized ${reason}.`) || req.abort()

// renderPageContent :: (Configuration, Logger, BrowserInstance, String) -> RenderedPage
const renderPageContent = async (configuration, logger, browserInstance, url) => {
    const page = await browserInstance.newPage();

    await page.setRequestInterception(true)
    page.on('request', cond([
        [complement(isRequestDomainAuthorized(configuration.worker.renderer.authorized_request_domains)), blockRequest(logger, 'domain')],
        [complement(isRequestResourceAuthorized(configuration.worker.renderer.authorized_request_resources)), blockRequest(logger, 'resource type')],
        // @todo add request redirection
        [T, allowRequest],
    ]))

    await page.goto(url, {
        waitUntil: 'networkidle0',
    });

    return await page.content()
}

// render :: (Configuration, Logger) -> String
export default (configuration, logger) => async url => {
    const browserProvider = getBrowserProvider();
    const browserInstance = await browserProvider.getInstance()

    try {
        return await renderPageContent(configuration, logger, browserInstance, url)
    } catch (error) {
        logger.error(
            `An error occurred while rendering the url "${url}".`,
            formatException(error),
        )
    } finally {
        browserProvider.cleanup()
    }
}
