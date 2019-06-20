import axiosWrapper, * as axios from './axios-wrapper'

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

export function getCategories (): Promise<string[]> {
  return axiosWrapper.get(`/${window['siteHash']}/product-management/categories`).then(rawResp => {
    const resp = rawResp.data
    if (resp.status && resp.data) {
      return resp.data.map(category => {
        return `${category.id} - ${category.name}`
      })
    } else {
      return { status: false, errMessage: resp.errMessage || 'Unexpected response!' }
    }
  })
}

export function getSubCategories () {
  return axiosWrapper.get(`/${window['siteHash']}/product-management/subCategories`).then(rawResp => {
    const resp = rawResp.data
    if (resp.status && resp.data) {
      return resp.data.map(subcategory => {
        const categoryName = subcategory.category && ' - ' + subcategory.category.name
        return `${subcategory.id} ${categoryName} - ${subcategory.name}`
      })
    } else {
      return { status: false, errMessage: resp.errMessage || 'Unexpected response!' }
    }
  })
}
