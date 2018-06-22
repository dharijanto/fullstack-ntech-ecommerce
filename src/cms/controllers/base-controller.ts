import {CMSController} from '../../site-definitions'

const path = require('path')

const express = require('express')
const bodyParser= require('body-parser')
const log = require('npmlog')

abstract class BaseController extends CMSController {
  constructor (initData) {
    super(Object.assign(initData, {viewPath: path.join(__dirname, 'views/v1')}))
  }

  getSidebar () {
    return [
      {
        title: 'Course Management',
        url: '/course-management',
        faicon: 'fa-dashboard'
      },
      {
        title: 'Dependency Visualizer',
        url: '/dependency-visualizer',
        faicon: 'fa-bar-chart-o',
        children: [
          {title: 'A', url: '/dependency-visualizer/a'},
          {title: 'B', url: '/dependency-visualizer/b'}]
      }
    ]
  }

}

export default BaseController