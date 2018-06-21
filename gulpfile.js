var fs = require('fs')
var path = require('path')

var gulp = require('gulp')
var gulpCopy = require('gulp-copy')
var sourcemaps = require('gulp-sourcemaps')
var ts = require('gulp-typescript')
var tsconfig = require('tsconfig')
var uglify = require('gulp-uglify-es').default
var watch = require('gulp-watch')

var project = tsconfig.loadSync(path.join(__dirname, 'tsconfig.json'))
var tsProject = ts.createProject('tsconfig.json')

// NCloud Site Smplementation (i.e. filos, tokowatch, etc)
const sitesDepsFiles = [
  'src/app/views/**',
  'src/cms/views/**'
]
const sitesFiles = project.config.include
  .concat(project.config.exclude.map(excludePath => '!' + excludePath))

gulp.task('compileSites', function () {
  return gulp.src(sitesFiles)
    .pipe(sourcemaps.init())
    .pipe(tsProject()).js
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/'))
})

gulp.task('compileSitesWithoutUglify', function () {
  return gulp.src(sitesFiles)
    .pipe(tsProject()).js
    .pipe(gulp.dest('dist/'))
})

gulp.task('copySitesDeps', function () {
  return gulp.src(sitesDepsFiles)
    .pipe(gulpCopy('dist/', {prefix: 1}))
})

gulp.task('watchSites', function () {
  return gulp.watch(sitesFiles, ['compileSitesWithoutUglify'])
})

gulp.task('watchSitesDeps', function () {
  return watch(sitesDepsFiles, vynil => {
    // src/[path to file]/file.ext
    const srcFile = vynil.history[0].slice((vynil.cwd + '/').length)
    // dest/[path to file]/file.ext
    const destFile = 'dist/' + srcFile.slice('src/'.length)
    switch (vynil.event) {
      case 'add':
      case 'change':
        gulp.src(srcFile).pipe(gulpCopy('dist/', {prefix: 1}))
        break
      case 'unlink':
        fs.unlink(destFile, err => {
          if (err) {
            console.error(err)
          }
        })
        break
    }
  })
})

gulp.task('watch', ['watchSites', 'watchSitesDeps'])
