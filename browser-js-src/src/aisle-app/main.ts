import * as $ from 'jquery'
import * as toastr from 'toastr'
import axios from '../libs/axios-wrapper'

$('#aisle-select').change(function (ev) {
  const aisle = $(this).val()
  console.log(aisle)
  axios.get(`/get-aisle-url?aisle=${aisle}&in-stock-products-page=1`).then(rawResp => {
    const resp = rawResp.data
    if (resp.status && resp.data) {
      const url = resp.data
      window.location = url
    } else {
      throw new Error('Failed to retrieve aisle url: ' + resp.errMessage)
    }
  }).catch(err => {
    toastr.error('Failed to retrieve aisle url: ' + err.message)
    console.error(err.message)
  })
})
