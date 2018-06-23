import * as path from 'path'

import * as express from 'express'
import {Sequelize} from 'sequelize'

export interface Database {
  sequelize: Sequelize
  models: {}
}

export interface User {
  id: number,
  username: string,
  email: string,
  siteId: number
}

export interface Site {
  id: number,
  templateId: string,
  name: string,
  dbName: string,
  hash: string
}

export interface SiteData {
  site: Site,
  user: User,
  socketIO: SocketIO,
  db: Database,
  viewPath: string,
  assetPath?: string
}

export type SocketIO = any

export interface DBStructure {
  // Return models
  addTables (sequelize: Sequelize, models: {}): {}
}

export abstract class AppController {
  readonly router: express.Express
  protected viewPath: string
  protected assetsPath: string
  protected siteData: SiteData
  protected interceptors: express.RequestHandler[] = []

  constructor (data: SiteData) {
    this.siteData = data
    this.router = express()
    // TODO: __dirname is not necessary
    this.viewPath = data.viewPath || path.join(__dirname, 'views')
    this.assetsPath = data.assetPath || path.join(this.viewPath, '/assets')

    this.router.set('views', this.viewPath)
    this.router.set('view engine', 'pug')
    this.router.use('/assets', express.static(this.assetsPath, {maxAge: '1h'}))
  }
  // Initialize the class. The reason this can't be done using constructor is because
  // we may have to wait until the initialization is compelte before preceeding
  initialize (): Promise<null> {
    return Promise.resolve(null)
  }

  // Whether the instance is still valid or not (i.e. there are updated files)
  isUpToDate (): Promise<boolean> {
    return Promise.resolve(true)
  }

  getInitData (): SiteData {
    return this.siteData
  }

  getDb (): Database {
    return this.siteData.db
  }

  getSite (): Site {
    return this.siteData.site
  }


  protected extendInterceptors (...fns: express.RequestHandler[]) {
    return this.interceptors.concat(fns)
  }

  protected  addInterceptor (...fns: express.RequestHandler[]) {
    this.interceptors = this.extendInterceptors(...fns)
  }

  routeAll (path, ...fns: express.RequestHandler[]) {
    this.router.all(path, this.extendInterceptors(...fns))
  }

  routeGet (path, ...fns: Array<express.RequestHandler>) {
    this.router.get(path, this.extendInterceptors(...fns))
  }

  routePost (path, ...fns: Array<express.RequestHandler>) {
    this.router.post(path, this.extendInterceptors(...fns))
  }

  routeUse (...fns: Array<express.RequestHandler>) {
    this.router.use('', this.extendInterceptors(...fns))
  }


  // When the instance of the class is no longer valid,
  // we have to evict out the cache so re-instantiation is clean
  evictRequireCache (): Promise<null> {
    return Promise.resolve(null)
  }

  getRouter (): express.Express {
    return this.router
  }
}

export abstract class CMSController {
  readonly siteHash: string
  readonly router: express.Express
  readonly subRouter: express.Express
  protected viewPath: string
  protected assetsPath: string
  protected interceptors: Array<any> = []
  readonly siteData: SiteData

  constructor (siteData: SiteData) {
    this.siteData = siteData
    this.siteHash = siteData.site.hash
    // Since the path is prefixed with /:hash/, we don't wanna handle it manually everytime, hence we use two routers
    this.router = express()
    this.subRouter = express()

    this.router.use(`/${this.siteHash}`, this.subRouter)
    this.subRouter.locals.rootifyPath = this.rootifyPath.bind(this)
    this.viewPath = siteData.viewPath
    this.assetsPath = siteData.assetPath || path.join(this.viewPath, '/assets')
    this.subRouter.use('/assets', express.static(this.assetsPath))
    this.subRouter.set('views', this.viewPath)
    this.subRouter.set('view engine', 'pug')
  }

  // Since we're using /:hash/path, we have to prepend :hash
  // as the root of the path, when referring to an asset
  protected rootifyPath (filename) {
    if (this.siteHash) {
      return `/${this.siteHash}/${filename}`
    } else {
      return `/${filename}`
    }
  }

  protected extendInterceptors (...fns: express.RequestHandler[]) {
    return this.interceptors.concat(fns)
  }

  protected  addInterceptor (...fns: express.RequestHandler[]) {
    this.interceptors = this.extendInterceptors(...fns)
  }

  routeAll (path: string, ...fns: express.RequestHandler[]) {
    this.subRouter.all(path, this.extendInterceptors(...fns))
  }

  routeGet (path: string, ...fns: Array<express.RequestHandler>) {
    this.subRouter.get(path, this.extendInterceptors(...fns))
  }

  routePost (path: string, ...fns: Array<express.RequestHandler>) {
    this.subRouter.post(path, this.extendInterceptors(...fns))
  }

  routeUse (path: string, ...fns: Array<express.RequestHandler>) {
    this.subRouter.use(path, this.extendInterceptors(...fns))
  }

  getRouter (): express.Express {
    return this.router
  }

  abstract getSidebar (): any[]
}