import { v4 as uuidv4 } from 'uuid'

export default () => ({
    _requests: {},

    has: function (id) {
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

    fail: function (id, error) {
        if (this.has(id)) {
            this._requests[id].res.status(500).end()
            delete this._requests[id]
        }
    },
})
