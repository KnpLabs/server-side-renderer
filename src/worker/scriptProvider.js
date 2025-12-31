import fs from 'fs'
import path from 'path'
import vm from 'vm'

export const POST_RENDER_SCRIPT_KEY = 'postRender'
const VALID_SCRIPT_KEYS = [POST_RENDER_SCRIPT_KEY]

const isScriptKeyValid = key => VALID_SCRIPT_KEYS.includes(key)

const resolveScriptPath = key => path.join(process.cwd(), `scripts/${key}.js`)

const resolveScriptContent = key => {
  const scriptPath = resolveScriptPath(key)
  return fs.readFileSync(scriptPath, { encoding: 'utf8', flag: 'r' })
}

const resolveScript = key => {
  const scriptContent = resolveScriptContent(key)
  const script = new vm.Script(scriptContent)
  const context = { script: null }

  vm.createContext(context)
  script.runInContext(context)

  if (typeof context.script !== 'function') {
    throw new Error(`The script provided doesn't set the script variable as a valid function.`)
  }

  return context.script
}

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
