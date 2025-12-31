import attachErrorMiddleware from './middlewares/error'
import attachNotFoundMiddleware from './middlewares/notFound'
import attachNotSupportedMiddleware from './middlewares/notSupported'
import attachRenderMiddleware from './middlewares/render'
import express from 'express'

export default (configuration, logger, queue, requestRegistry) => {
  const app = express()

  attachRenderMiddleware(configuration, logger, queue, requestRegistry)(app)
  attachNotFoundMiddleware(app)
  attachNotSupportedMiddleware(app)
  attachErrorMiddleware(logger)(app)

  return app.listen(
    configuration.manager.http_server.port,
    configuration.manager.http_server.host,
    () => logger.debug('Manager http server started.'),
  )
}
