var fs = require('fs')
var path = require('path')

var browserify = require('browserify')
var log = require('fancy-log')
var tsify = require('tsify')
var watchify = require('watchify')

const modules = [
  {
    input: 'product-management-cms',
    output: 'cms'
  },
  {
    input: 'product-description-cms',
    output: 'cms'
  },
  {
    input: 'shop-management-cms',
    output: 'cms'
  },
  {
    input: 'promotion-management-cms',
    output: 'cms'
  },
  {
    input: 'supplier-management-cms',
    output: 'cms'
  },
  {
    input: 'order-management-cms',
    output: 'cms'
  }
]

modules.forEach(module => {
  log(`Watching module: ${module.input}...`)
  const b = browserify(
    [path.join(__dirname, 'src', module.input, 'main.ts'), path.join(__dirname, 'src/index.d.ts')],
      {cache: {}, packageCache: {}, debug: true})
  .plugin(tsify, {target: 'es6'})
  .transform('babelify', {presets: ['es2015']})
  .transform({global: true}, 'browserify-shim')
  /* .transform('uglifyify', {global: true}) */
  .plugin(watchify)

  b.on('update', () => bundle(b, module.input, module.output))
  b.on('error', err => log.error(err.message))

  bundle(b, module.input, module.output)
})

function bundle (b, module, outputFolder) {
  log(`Bundling module: ${module}...`)
  b.bundle()
    .on('error', err => log.error(err.message))
    .pipe(fs.createWriteStream(path.join(__dirname, `../dist/${outputFolder}/views/v1/assets/js/${module}-bundle.js`)))
    .on('finish', () => {
      log(`Finished Bundling module: ${module}...`)
    })
}
