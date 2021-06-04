import 'regenerator-runtime/runtime' // needed to be able to execute transpiled generator functions like async/await
import fetch from 'node-fetch'

const trimStringForComparison = str => str.replace(/^[\s]+|[\s]+$/gm, '').replace(/\n/g, '')

describe('e2e :: render', () => {
  it(`asserts that a static page is rendered`, async () => {
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

  it(`asserts that a dynamic page is rendered`, async () => {
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

  it(`asserts that a dynamic page with redirections is rendered`, async () => {
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

  it(`asserts that a bad request is returned when url query parameter is missing`, async () => {
    const res = await fetch(`http://manager:8080/render`)

    expect(res.status).toBe(400)
  })
})

describe('e2e :: not found', () => {
  it(`asserts that the request returns a 404 response`, async () => {
    const res = await fetch(`http://manager:8080/non-existing-endpoint`)

    expect(res.status).toBe(404)
  })
})

describe('e2e :: method not supported', () => {
  it(`asserts that a OPTIONS request returns a 405 response`, async () => {
    const res = await fetch(`http://manager:8080/render?url=http://nginx/static.html`, { method: 'OPTIONS' })

    expect(res.status).toBe(405)
  })

  it(`asserts that a POST request returns a 405 response`, async () => {
    const res = await fetch(`http://manager:8080/render?url=http://nginx/static.html`, { method: 'POST' })

    expect(res.status).toBe(405)
  })

  it(`asserts that a PUT request returns a 405 response`, async () => {
    const res = await fetch(`http://manager:8080/render?url=http://nginx/static.html`, { method: 'PUT' })

    expect(res.status).toBe(405)
  })

  it(`asserts that a PATCH request returns a 405 response`, async () => {
    const res = await fetch(`http://manager:8080/render?url=http://nginx/static.html`, { method: 'PATCH' })

    expect(res.status).toBe(405)
  })

  it(`asserts that a DELETE request returns a 405 response`, async () => {
    const res = await fetch(`http://manager:8080/render?url=http://nginx/static.html`, { method: 'DELETE' })

    expect(res.status).toBe(405)
  })
})
