var fs = require('fs')
var path = require('path')

var browserify = require('browserify')
var log = require('fancy-log')
var tsify = require('tsify')
var watchify = require('watchify')


// Enumerate ./src directory to find *-cms and *-app folder
// The main.ts file inside the directory is going to be bundled to respective cms or app output folder
const sourceDir = path.join(__dirname, 'src')
const modules = fs.readdirSync(sourceDir).filter(filename => {
  const split = filename.split('-')
  // Valid source folder ends with '-cms' or '-app'
  const validSourceDirName = split[split.length - 1] === 'cms' || split[split.length - 1] === 'app'
  return fs.statSync(path.join(sourceDir,filename)).isDirectory() && validSourceDirName
}).map(dir => {
  const split = dir.split('-')
  if (split.length < 2) {
    throw new Error('Unexpected browser-js-src source directory: ' + dir)
  }
  return {
    input: dir,
    output: split[split.length - 1]
  }
})

function getAssetFolder(outputFolder, moduleName) {
  if (outputFolder === 'app') {
    return path.join(__dirname, `../dist/${outputFolder}/views/assets/js/${moduleName}-bundle.js`)
  } else if (outputFolder === 'cms') {
    return path.join(__dirname, `../dist/${outputFolder}/views/v1/assets/js/${moduleName}-bundle.js`)
  } else {
    throw new Error('Unexpected outputFolder=' + outputFolder)
  }
}

modules.forEach(module => {
  log(`Watching module: ${module.input}...`)
  const b = browserify(
    [path.join(__dirname, 'src', module.input, 'main.ts'), path.join(__dirname, 'src/index.d.ts')],
      {cache: {}, packageCache: {}, debug: true})
  // When option 'files: []' passed, only browserify entry point is watched.
  // Otherwise, any changes in any of the .ts file, even unrelated ones, will trigger 'update' events
  .plugin(tsify, {target: 'es6', files: []})
  .transform('babelify', {presets: ['es2015']})
  .transform({global: true}, 'browserify-shim')
  /* .transform('uglifyify', {global: true}) */
  .plugin(watchify)

  b.on('update', () => bundle(b, module.input, module.output))
  b.on('error', err => log.error(err.message))

  bundle(b, module.input, module.output)
})

function bundle (b, moduleName, outputFolder) {
  log(`Bundling module: ${moduleName}...`)
  b.bundle()
    .on('error', err => log.error(err.message))
    .pipe(fs.createWriteStream(getAssetFolder(outputFolder, moduleName)))
    .on('finish', () => {
      log(`Finished Bundling module: ${moduleName}...`)
    })
}
