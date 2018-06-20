import {CMSController} from '../../site-definitions'

const path = require('path')

const express = require('express')
const bodyParser= require('body-parser')
const log = require('npmlog')

abstract class BaseController extends CMSController {
  
}

export default BaseController