import { pipe } from 'ramda'
import express from 'express'
import attachRenderMiddleware from './middlewares/render'

// createHttpServer => (Logger, Queue) -> HttpServer
export default (logger, queue, requestRegistry) => pipe(
    attachRenderMiddleware(logger, queue, requestRegistry),
    app => app.listen(
        Number(process.env.MANAGER_HTTP_SERVER_PORT) || 8990,
        process.env.MANAGER_HTTP_SERVER_HOST || '0.0.0.0',
        () => logger.info('Manager http server started.'),
    )
)(express())
