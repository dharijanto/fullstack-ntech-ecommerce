import * as $ from 'jquery'
import * as toastr from 'toastr'

import axios from '../libs/axios-wrapper'

const selectVariant = $('#select-variant')
const selectQuantity = $('#select-quantity')

$('#add-to-cart').on('click', function () {
  const variantId = selectVariant.find(':selected').data('id')
  const quantity = selectQuantity.val()
  axios.post('/cart/add-po-item', {
    variantId,
    quantity
  }).then(rawResp => {
    const resp = rawResp.data
    console.dir(resp)
    // TODO: Show up modal
    if (resp.status) {
      toastr.success('Success!')
    } else {
      toastr.error('Error: ' + resp.errMessage)
    }
  })
})
