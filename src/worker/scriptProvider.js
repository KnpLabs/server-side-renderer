import { __, includes, pipe } from 'ramda'
import fs from 'fs'
import path from 'path'
import vm from 'vm'

/**
 * @type ScriptProvider = {
 *     get :: String -> Function,
 * }
 */

export const POST_RENDER_SCRIPT_KEY = 'postRender'
const VALID_SCRIPT_KEYS = [POST_RENDER_SCRIPT_KEY]

// isScriptKeyValid :: String -> Boolean
const isScriptKeyValid = includes(__, VALID_SCRIPT_KEYS)

// resolveScriptPath :: String -> String
const resolveScriptPath = key => path.join(process.cwd(), `scripts/${key}.js`)

// resolveScriptContent :: String -> String
const resolveScriptContent = pipe(
  resolveScriptPath,
  scriptPath => fs.readFileSync(scriptPath, { encoding: 'utf8', flag: 'r' }),
)

// resolveScript :: String -> Function
const resolveScript = pipe(
  resolveScriptContent,
  scriptContent => {
    const script = new vm.Script(scriptContent)

    const context = { script: null }
    vm.createContext(context)

    script.runInContext(context)

    if (typeof context.script !== 'function') {
      throw new Error(`The script provided doesn't set the script variable as a valid function.`)
    }

    return context.script
  },
)

// createScriptProvider :: () -> ScriptProvider
export default () => ({
  _scripts: {},

  get: function (key) {
    if (!isScriptKeyValid(key)) {
      throw new Error(`Non supported script key. "${key}" provided but expected one of ${VALID_SCRIPT_KEYS.join(', ')}.`)
    }

    // eslint-disable-next-line no-prototype-builtins
    if (!this._scripts.hasOwnProperty(key)) {
      this._scripts[key] = resolveScript(key)
    }

    return this._scripts[key]
  },
})
