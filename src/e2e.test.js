import 'regenerator-runtime/runtime' // needed by the SSR to be able to execute transpiled generator functions like async/await
import fetch from 'node-fetch'

const trimStringForComparison = str => str.replace(/^[\s]+|[\s]+$/gm, '').replace(/\n/g, '')

describe('e2e :: static', () => {
  it(`asserts that the page is rendered`, async () => {
    const res = await fetch(`http://manager:8080/render?url=http://nginx/static.html`)
    const content = await res.text()

    expect(res.status).toBe(200)
    expect(trimStringForComparison(content)).toBe(trimStringForComparison(`
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <title>A static HTML page</title>
                </head>
                <body>
                    <h1>A static HTML page</h1>
                </body>
            </html>
        `))
  })
})

describe('e2e :: dynamic', () => {
  it(`asserts that the page is rendered`, async () => {
    const res = await fetch(`http://manager:8080/render?url=http://nginx/dynamic.html`)
    const content = await res.text()

    expect(res.status).toBe(200)
    expect(trimStringForComparison(content)).toBe(trimStringForComparison(`
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <title>A dynamic HTML page</title>
                </head>
                <body>
                    <h1>A dynamic HTML page</h1>
                    <script>
                        window.onload = event => {
                            fetch('/dynamic.json')
                                .then(response => response.json())
                                .then(data => {
                                    const newParagraph = document.createElement("p");
                                    const newContent = document.createTextNode(data.content);
                                    newParagraph.appendChild(newContent);

                                    document.body.append(newParagraph)
                                });
                        };
                    </script>
                    <p>Some dynamic content.</p>
                </body>
            </html>
        `))
  })
})

describe('e2e :: redirection', () => {
  it(`asserts that the page is rendered`, async () => {
    const res = await fetch(`http://manager:8080/render?url=http://nginx/redirection.html`)
    const content = await res.text()

    expect(res.status).toBe(200)
    expect(trimStringForComparison(content)).toBe(trimStringForComparison(`
              <!DOCTYPE html>
              <html lang="en">
                  <head>
                      <meta charset="utf-8">
                      <title>A dynamic HTML page (redirections)</title>
                  </head>
                  <body>
                      <h1>A dynamic HTML page (redirections)</h1>
                      <script>
                          window.onload = event => {
                              fetch('http://external-nginx/dynamic.json')
                                  .then(response => response.json())
                                  .then(data => {
                                      const newParagraph = document.createElement("p");
                                      const newContent = document.createTextNode(data.content);
                                      newParagraph.appendChild(newContent);

                                      document.body.append(newParagraph)
                                  });
                          };
                      </script>
                      <p>Some dynamic content.</p>
                  </body>
              </html>
          `))
  })
})
