import SearchService from '../services/search-service'

SearchService.initialize().then(() => {
  console.log('Search service initialized!')
  SearchService.searchInStockProducts('Flash Drive').then(result => {
    console.dir(result)
  }).catch(err => {
    console.error('Search error: ' + err)
  })
}).catch(err => {
  console.error('Search service failed to initialize: ' + err)
})
