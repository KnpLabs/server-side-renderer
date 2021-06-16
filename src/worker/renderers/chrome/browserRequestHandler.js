import { T, anyPass, complement, cond, equals, find, ifElse, isNil, pipe, replace, tap, test } from 'ramda'

// resolveRequestDomain :: Request -> String
const resolveRequestDomain = req => req.url().match(/^(https?:\/\/)?(?<host>[^/]+)/).groups.host

// isMatchingDomain :: String -> String -> Boolean
const isMatchingDomain = input => value =>
  test(new RegExp(`^${replace('*', '.*', value)}$`, 'i'), input)

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

// getRedirection :: [Object] -> Request -> Object|Null
const getRedirection = redirections => req => find(
  ({ from }) => test(new RegExp(`^${from}`, 'i'), req.url()),
  redirections,
)

// allowRequest :: (logger, [Object]) -> Request -> _
const allowRequest = (logger, redirections) => req => pipe(
  getRedirection(redirections),
  ifElse(
    isNil,
    () => req.continue(),
    pipe(
      ({ from, to }) => replace(new RegExp(`^${from}`, 'i'), to, req.url()),
      tap(redirectedUrl => logger.debug(`Redirecting "${req.url()}" to ${redirectedUrl}`)),
      redirectedUrl => req.continue({ url: redirectedUrl }),
    ),
  ),
)(req)

// blockRequest :: (Logger, String) -> Request -> _
const blockRequest = (logger, reason) => req => logger.debug(`Abort request ${req.url()} because of non authorized ${reason}.`) || req.abort()

// browserRequestHandler :: (Configuration, Logger) => Puppeteer.Request => _
export default (configuration, logger) => cond([
  [
    complement(isRequestDomainAuthorized(configuration.worker.renderer.authorized_request_domains)),
    blockRequest(logger, 'domain'),
  ],
  [
    complement(isRequestResourceAuthorized(configuration.worker.renderer.authorized_request_resources)),
    blockRequest(logger, 'resource type'),
  ],
  [T, allowRequest(logger, configuration.worker.renderer.redirections)],
])
