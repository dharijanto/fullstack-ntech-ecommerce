// https://stackoverflow.com/questions/4656843/jquery-get-querystring-from-url
export function getURLQuery (url: string): {[key: string]: string} {
  let vars = {}
  let hash
  let hashes = url.slice(url.indexOf('?') + 1).split('&')
  for (let i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=')
    vars[hash[0]] = hash[1]
  }
  return vars
}
