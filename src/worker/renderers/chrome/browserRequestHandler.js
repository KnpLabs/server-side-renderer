import { T, anyPass, complement, cond, equals, find, ifElse, isNil, pipe, replace, tap, test } from 'ramda'

const resolveRequestDomain = req => req.url().match(/^(https?:\/\/)?(?<host>[^/]+)/).groups.host

const isMatchingDomain = input => value =>
  test(new RegExp(`^${replace('*', '.*', value)}$`, 'i'), input)

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

const getRedirection = redirections => req => find(
  ({ from }) => test(new RegExp(`^${from}`, 'i'), req.url()),
  redirections,
)

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

const blockRequest = (logger, reason) => req => logger.debug(`Abort request ${req.url()} because of non authorized ${reason}.`) || req.abort()

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
