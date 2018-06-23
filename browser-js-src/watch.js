var fs = require('fs')
var path = require('path')

var browserify = require('browserify')
var log = require('fancy-log')
var tsify = require('tsify')
var watchify = require('watchify')

const modules = [
  {
    input: 'category-cms',
    output: 'cms'
  }
]

modules.forEach(module => {
  log(`Watching module: ${module.input}...`)
  const b = browserify(path.join(__dirname, module.input, 'main.ts'), {cache: {}, packageCache: {}, debug: true})
  .transform({global: true}, 'browserify-shim')
  .plugin(tsify, {target: 'es6'})
  .transform('babelify', {presets: ['es2015', 'react']})
  .transform('uglifyify', {global: true})
  .plugin(watchify)

  b.on('update', () => bundle(b, module.input, module.output))
  b.on('error', err => log.error(err.message))

  bundle(b, module.input, module.output)
})

function bundle (b, module, outputFolder) {
  log(`Bundling module: ${module}...`)
  b.bundle()
    .on('error', err => log.error(err.message))
    .pipe(fs.createWriteStream(path.join(__dirname, `../dist/${outputFolder}/views/assets/js/${module}-bundle.js`)))
    .on('finish', () => {
      log(`Finished Bundling module: ${module}...`)
    })
}
