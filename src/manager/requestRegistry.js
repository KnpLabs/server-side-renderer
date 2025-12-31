import { v4 as uuidv4 } from 'uuid'

export default () => ({
  _requests: {},

  has: function (id) {
    // eslint-disable-next-line no-prototype-builtins
    return this._requests.hasOwnProperty(id)
  },

  add: function (req, res, next) {
    const id = uuidv4()

    this._requests[id] = { req, res, next }

    return id
  },

  complete: function (id, result, status = 200) {
    if (this.has(id)) {
      this._requests[id].res.status(status).send(result)
      delete this._requests[id]
    }
  },

  fail: function (id, status = 500) {
    if (this.has(id)) {
      this._requests[id].res.status(status).end()
      delete this._requests[id]
    }
  },
})
