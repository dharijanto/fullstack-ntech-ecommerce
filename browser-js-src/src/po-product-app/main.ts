import * as $ from 'jquery'
import * as toastr from 'toastr'

import axios from '../libs/axios-wrapper'

const selectVariant = $('#select-variant')

// Any quantity can be PO-ed
const selectQuantity = $('#select-quantity')
selectQuantity.empty()
for (let i = 1; i <= 9; i++) {
  selectQuantity.append(`<option data-quantity=${i}>${i}</option>`)
}

$('#add-to-cart').on('click', function () {
  const variantId = selectVariant.find(':selected').data('id')
  const quantity = selectQuantity.val()
  axios.post('/cart/add-item', {
    variantId,
    quantity
  }).then(rawResp => {
    const resp = rawResp.data
    console.dir(resp)
    if (resp.status) {
      toastr.success('Success!')
      $('#cart-modal').modal()
    } else {
      toastr.error('Error: ' + resp.errMessage)
    }
  })
})
