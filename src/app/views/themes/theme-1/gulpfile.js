var path = require('path');
var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var maps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var server = require('browser-sync').create();


// Each of the theme is located at the following path:
// /src/app/views/themes/[themeName]/...
const themeName = path.basename(path.join(__dirname, '.'))

function reload(done) {
  server.reload();
  done();
}

function serve(done) {
  server.init({
    server: {
      baseDir: 'app'
    }
  });
  done();
}


// compile sass to css
function css() {
  return gulp.src('app/assets/scss/style.scss')
  .pipe(maps.init())
  .pipe(sass())
  .pipe(maps.write('./'))
  // For static-html testing purposes
  .pipe(gulp.dest('app/assets/css'))
  .pipe(gulp.dest(`../../assets/themes/${themeName}/css`))
  .pipe(server.stream());
}


// concatenate js files
function scripts() {
  return gulp.src([
  	'node_modules/jquery/dist/jquery.js',
  	'node_modules/bootstrap/dist/js/bootstrap.bundle.js',
  	'node_modules/owl.carousel/dist/owl.carousel.min.js',
    'node_modules/owl.carousel2.thumbs/dist/owl.carousel2.thumbs.min.js',
  	'node_modules/swiper/dist/js/swiper.min.js',
  	'node_modules/masonry-layout/dist/masonry.pkgd.min.js',
    'node_modules/imagesloaded/imagesloaded.js',
  	'node_modules/lavalamp/js/jquery.lavalamp.min.js',
  	'node_modules/headroom.js/dist/headroom.js',
  	'node_modules/headroom.js/dist/jQuery.headroom.js',
  	'node_modules/magnific-popup/dist/jquery.magnific-popup.min.js',
    'node_modules/ion-rangeslider/js/ion.rangeSlider.min.js',
    'node_modules/skrollr/dist/skrollr.min.js',
    'node_modules/smooth-scroll/dist/smooth-scroll.min.js',
    'node_modules/jquery-countdown/dist/jquery.countdown.min.js',
    'node_modules/clipboard/dist/clipboard.min.js',
    'node_modules/prismjs/prism.js',
    'node_modules/prismjs/plugins/toolbar/prism-toolbar.min.js',
    'node_modules/prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js',
    'node_modules/jquery-zoom/jquery.zoom.js'
    ])
    .pipe(maps.init())
    .pipe(concat('vendor.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('app/assets/js'))
    .pipe(gulp.dest(`../../assets/themes/${themeName}/js`));
}


// concatenate css files
function styles() {
  return gulp.src([
  	'node_modules/owl.carousel/dist/assets/owl.carousel.min.css',
  	'node_modules/swiper/dist/css/swiper.min.css',
  	'node_modules/magnific-popup/dist/magnific-popup.css',
    'node_modules/ion-rangeslider/css/ion.rangeSlider.min.css',
    'node_modules/prismjs/themes/prism.css',
    'node_modules/prismjs/plugins/toolbar/prism-toolbar.css',
    'node_modules/prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js'
    ])
    .pipe(maps.init({loadMaps: true}))
    .pipe(concat("vendor.css"))
    .pipe(maps.write())
    .pipe(gulp.dest('app/assets/css'))
    .pipe(gulp.dest(`../../assets/themes/${themeName}/css`));
}


// minify js
function minify() {
  return gulp.src('app/assets/js/vendor.js')
  .pipe(maps.init())
  .pipe(uglify())
  .pipe(rename('vendor.min.js'))
  .pipe(maps.write('./'))
  .pipe(gulp.dest('app/assets/js'))
  .pipe(gulp.dest(`../../assets/themes/${themeName}/js`));
}



// watch for changes
function watch() {
  gulp.watch('app/assets/scss/**/*.scss', css);
  gulp.watch(['app/*.html','app/**/*.html', 'app/assets/js/*.js'], reload);
  gulp.watch('gulpfile.js', gulp.series(scripts, styles, minify));
}

const build = gulp.series(css, scripts, styles, minify, gulp.parallel(serve, watch));

// tasks
exports.css = css;
exports.scripts = scripts;
exports.styles = styles;
exports.minify = minify;

exports.default = build;
