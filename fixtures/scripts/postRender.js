script = () => {
    if ('/post-render-script.html' === window.location.pathname) {
        const paragraphElement = document.createElement('p')
        const textNode = document.createTextNode("This element has been created by the post render script.");

        paragraphElement.appendChild(textNode)

        document.body.append(paragraphElement)
    }
}
