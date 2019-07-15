// Set an iframe identified by 'iframeName' to 'url', then
// open up print dialog, and finally, wait for it to complete
export function openPrintDialog (url, iframeJqueryElement, iframeName) {
  return new Promise((resolve, reject) => {
    iframeJqueryElement.attr('src', url)
    iframeJqueryElement.on('load', () => {
      frames[iframeName].print()
      frames[iframeName].addEventListener('afterprint', (event) => {
        resolve()
      })
    })
  })
}
