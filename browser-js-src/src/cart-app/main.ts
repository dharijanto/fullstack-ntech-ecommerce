import * as $ from 'jquery'
import * as toastr from 'toastr'
import axios from '../libs/axios-wrapper'

console.log('hehe')

function addItem (variantId: number, quantity: number) {
  axios.post('/cart/add-item', {
    variantId,
    quantity
  }).then(rawResp => {
    const resp = rawResp.data
    if ('status' in resp) {
      if (resp.status) {
        location.reload()
      } else {
        toastr.error(resp.errMessage)
        console.error('Failed to add item: ' + resp.errMessage)
      }
    } else {
      throw new Error('Unexpected data returned by server: ' + JSON.stringify(resp))
    }
  }).catch(err => {
    console.error(err)
    toastr.error(err.status)
  })
}

$(window).ready(() => {
  $('.add-item').on('click', function () {
    console.log('add item clicked')
    const variantId = $(this).data('variant-id')
    const quantity = 1
    addItem(variantId, quantity)
  })

  $('.reduce-item').on('click', function () {
    console.log('reeduce item clicked')
    const variantId = $(this).data('variant-id')
    const quantity = -1
    addItem(variantId, quantity)
  })

  $('#place-order').on('click', function () {
    const orderData = $('#order-form').serialize()
    axios.post('/cart/place-order', orderData).then(rawResp => {
      const resp = rawResp.data
      if (resp.status) {
        toastr.success('Order has been placed!')
        window.location.replace('/cart/order-placed')
      } else {
        console.error(resp.errMessage)
        toastr.error('Failed: ' + resp.errMessage)
      }
    }).catch(err => {
      console.error(err)
      toastr.error('Error: ' + err.message)
    })
  })
})
