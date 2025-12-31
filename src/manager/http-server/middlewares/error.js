import { formatException } from '../../../logger'

export default logger => app =>
  app.use((error, req, res, next) => {
    logger.error(formatException(error))
    if (res.headersSent) return next(error)
    return res.status(500).send()
  })
