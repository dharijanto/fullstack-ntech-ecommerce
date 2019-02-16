/* Contains code that is used by both inStockProduct and poProducts */

import * as $ from 'jquery'
import * as toastr from 'toastr'

import axios from '../libs/axios-wrapper'
const currentImg = $('#img-current')

$('.img-gallery').on('click', function () {
  const img = $(this)
  const src = img.attr('src')
  currentImg.attr('src', src)
  console.dir(src)
})
