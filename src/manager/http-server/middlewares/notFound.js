// default :: Express.app -> Express.app
export default app => app.get(/.*/, (req, res) => res.status(404).send())
