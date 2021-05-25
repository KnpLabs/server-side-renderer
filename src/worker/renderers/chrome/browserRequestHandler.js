import { T, anyPass, complement, cond, equals, find, ifElse, isNil, pipe, propEq, test } from 'ramda'

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

// getDomainRedirection :: [Object] -> Request -> Object|Null
const getDomainRedirection = domainRedirections => domain => find(propEq('from', domain), domainRedirections)

// allowRequest :: Request -> _
const allowRequest = domainRedirections => req => pipe(
  resolveRequestDomain,
  getDomainRedirection(domainRedirections),
  ifElse(
    isNil,
    () => req.continue(),
    ({ from, to }) => req.continue({
      url: req.url().replace(from, to),
    }),
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
  [T, allowRequest(configuration.worker.renderer.domain_redirections)],
])
