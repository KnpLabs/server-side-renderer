// default :: Express.app -> Express.app
export default app => app.use((req, res) => res.status(405).send())
