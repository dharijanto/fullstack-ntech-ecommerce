import * as express from 'express'
import AppConfig from '../../app-config'
import * as Promise from 'bluebird'

import BaseController from './base-controller'
import CartService from '../../services/cart-service'
import { SiteData } from '../../site-definitions'
import * as Utils from '../../libs/utils'
import LocalShopService from '../../services/local-shop-service'

const path = require('path')

let log = require('npmlog')

const TAG = 'MainController'

export default class CartController extends BaseController {
  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, '../views') }))
    this.routePost('/add-item', (req, res, next) => {
      console.dir(req.session)
      if (req.body.variantId && req.body.quantity) {
        const data = {
          variantId: req.body.variantId,
          quantity: parseInt(req.body.quantity, 10)
        }
        LocalShopService.getVariantAvailability(req.body.variantId).then(resp => {
          if (resp.status && resp.data) {
            if (resp.data === 'unavailable') {
              res.json({ status: false, errMessage: 'Product is not available!' })
            } else {
              if (req.session) {
                CartService.addItemToCart(resp.data, req.session.cart, data).then(resp => {
                  if (resp.status) {
                    if (req.session) {
                      req.session.cart = resp.data
                      res.json({ status: true, data: resp.data })
                    } else {
                      res.json({ status: false, errMessage: 'Session is not defined!' })
                    }
                  } else {
                    res.json(resp)
                  }
                })
              } else {
                res.json({ status: false, errMessage: 'Session is not defined!' })
              }
            }
          } else {
            res.json({ status: false, errMessage: 'Failed to get variant availability: ' + resp.errMessage })
          }
        })
      } else {
        res.json({ status: false, errMessage: 'variantId and quantity are required!' })
      }
    })
/*
    // TODO: This should be removed! /add-item should detect whether the item is PO or ready stock!
    // we don't wanna maintain two separate logic
    this.routePost('/add-po-item', (req, res, next) => {
      console.dir(req.session)
      if (req.session) {
        if (req.body.variantId && req.body.quantity) {
          const data = {
            variantId: req.body.variantId,
            quantity: parseInt(req.body.quantity, 10)
          }
          CartService.addItemToCart('preOrder', req.session.cart, data).then(resp => {
            if (resp.status) {
              if (req.session) {
                req.session.cart = resp.data
                res.json({ status: true, data: resp.data })
              } else {
                res.json({ status: false, errMessage: 'Session is not defined!' })
              }
            } else {
              res.json(resp)
            }
          })
        } else {
          res.json({ status: false, errMessage: 'variantId and quantity are required!' })
        }
      } else {
        res.json({ status: false, errMessage: 'Session is not defined!' })
      }
    }) */

    this.routeGet('/', (req, res, next) => {
      if (req.session) {
        CartService.getCart(req.session.cart).then(resp => {
          if (resp.status) {
            res.locals.cart = resp.data
            res.render('cart')
          } else {
            next(new Error(resp.errMessage))
          }
        })
      } else {
        next(new Error('Session is not defined!'))
      }
    })

  }
}
