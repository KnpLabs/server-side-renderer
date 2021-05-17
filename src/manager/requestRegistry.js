import { v4 as uuidv4 } from 'uuid'

/**
 * @type RequestRegistry = {
 *     has :: String -> Boolean,
 *     add :: (Request, Response, Next) -> String,
 *     complete :: (String, String) -> _,
 *     fail :: (String, String) -> _,
 * }
 */

// createRequestRegistry :: () -> RequestRegistry
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

  complete: function (id, result) {
    if (this.has(id)) {
      this._requests[id].res.send(result)
      delete this._requests[id]
    }
  },

  fail: function (id) {
    if (this.has(id)) {
      this._requests[id].res.status(500).end()
      delete this._requests[id]
    }
  },
})
