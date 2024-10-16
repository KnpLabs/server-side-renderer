/**
 * Post render script executed by Puppeteer's evaluate method before returning
 * the rendered html page. See https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pageevaluatepagefunction-args)
 * for more information.
 *
 * In order to use a custom post render script you have to mount your own
 * script as a Docker volume to `/app/scripts/postRender.js` location.
 * Your custom script will just have to assign the function you want to execute
 * to the `script` variable.
 *
 * Example:
 * ```javascript
 *     // Adds the serialized Redux store
 *     script = function () {
 *         var preloadedState = yourReduxStore.getState();
 *         var script = document.createElement('script');
 *         script.type = 'text/javascript';
 *         script.text = 'window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, \\u003c')}';
 *
 *         document.body.prepend(script);
 *     }
 * ```
 */
script = function () {};
