import { ifElse, pipe, tap } from 'ramda'
import { formatException } from '../../../logger'

// errorMiddleware :: Logger -> Express.Application -> Void
export default logger => app =>
  app.use(pipe(
    tap(error => logger.error(formatException(error))),
    ifElse(
      (error, req, res) => res.headersSent,
      (error, req, res, next) => next(error),
      (error, req, res) => res.status(500).send(),
    ),
  ))
