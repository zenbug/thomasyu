var gulp = require('gulp');
var uglify = require('gulp-uglify');
var livereload = require('gulp-livereload');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var del = require('del');
var zip = require('gulp-zip');

// Image compression:
var imagemin = require('gulp-imagemin');
var imageminPngquant = require('imagemin-pngquant');
var imageminJpegRecompress = require('imagemin-jpeg-recompress');

// File paths
var DIST_PATH = 'public/dist';
var SCRIPTS_PATH = 'public/scripts/**/*.js'
var CSS_PATH = 'public/css/**/*.css';
var IMAGES_PATH = 'public/images/**/*.{png,jpeg,jpg,svg,gif}';

// apply PostCSS plugins
gulp.task('css', function() {
  return gulp.src('src/main.css')
    .pipe(postcss([
      require('autoprefixer')({}),
      require('cssnano')
    ]))
    .pipe(gulp.dest('dist/main.css'));
});

/*
// Styles (vanilla CSS, not SASS):
gulp.task('styles', function() {
    console.log('starting styles task');
    // Load all the CSS files in the order we want:
    return gulp.src(['public/css/reset.css', CSS_PATH])
        // Plumber allows errors to happen without making you restart Gulp Watch in the terminal:
        .pipe(plumber(function (err){
            // State that there's an error:
            console.log('Styles task error');
            // Output the error itself:
            console.log(err);
            // Stop running the rest of the proceces, but keep running Gulp:
            this.emit('end');
        }))
        // Sourcemaps keeps track of CSS rules in their original files, even after we've concatenated and minified them:
        .pipe(sourcemaps.init())
        // Add any vendor-specific vendor prefixes to allow older browsers to support stuff like Flexbox:
        .pipe(autoprefixer())
        // Then combine them:
        .pipe(concat('styles.css'))
        // Minify that resulting file:
        .pipe(minifyCss())
        .pipe(sourcemaps.write())
        // Then save the result to the dist folder:
        .pipe(gulp.dest(DIST_PATH))
        // Then reload the browser:
        .pipe(livereload());
});
*/

// Styles (SASS):
gulp.task('styles', function() {
    console.log('starting styles task');
    // Load all the CSS files in the order we want:
    return gulp.src('public/scss/styles.scss')
        // Plumber allows errors to happen without making you restart Gulp Watch in the terminal:
        .pipe(plumber(function (err){
            // State that there's an error:
            console.log('!!!!!!!!!!!!!!!!!!!!!!!! Styles task error! !!!!!!!!!!!!!!!!!!!!!!!! ');
            // Output the error itself:
            console.log(err);
            // Stop running the rest of the proceces, but keep running Gulp:
            this.emit('end');
        }))
        // Sourcemaps keeps track of CSS rules in their original files, even after we've concatenated and minified them:
        .pipe(sourcemaps.init())
        // Add any vendor-specific vendor prefixes to allow older browsers to support stuff like Flexbox:
        // ! I COMMENTED OUT autoprefixer BECAUSE IT WAS GIVING ME PROBLEMS COMPILING SASS CODE:
        //.pipe(autoprefixer())
        // Then combine them (This is commented out because we're combining them in SASS with @include):
        //.pipe(concat('styles.css'))
        // Minify that resulting file (This is commented out because it's built into the SASS Gulp plugin):
        //.pipe(minifyCss())
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(sourcemaps.write())
        // Then save the result to the dist folder:
        .pipe(gulp.dest(DIST_PATH))
        // Then reload the browser:
        .pipe(livereload());
});

// Scripts
gulp.task('scripts', function () {
    console.log('Starting scripts task');

    return gulp.src(SCRIPTS_PATH)
        .pipe(plumber(function (err){
            // State that there's an error:
            console.log('!!!!!!!!!!!!!!!!!!!!!!!! Scripts task error! !!!!!!!!!!!!!!!!!!!!!!!! ');
            // Output the error itself:
            console.log(err);
            // Stop running the rest of the proceces, but keep running Gulp:
            this.emit('end');
        }))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat('scripts.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(DIST_PATH))
        .pipe(livereload());
});

// Images
gulp.task('images', function() {
    return gulp.src(IMAGES_PATH)
        .pipe(imagemin(
            [
                // Let imagemin use its native plugins:
                imagemin.gifsicle(),
                imagemin.jpegtran(),
                imagemin.optipng(),
                imagemin.svgo(),
                // But also add our new plugins:
                imageminPngquant(),
                imageminJpegRecompress()
            ]
        ))
        .pipe(gulp.dest(DIST_PATH + '/images'));

});

// Clean. Deletes the entire dist folder:
gulp.task('clean', function () {
    return del.sync([
        DIST_PATH
    ]);
});

// Default task. (The tasks clean, images, styles, and scripts will run before the one called "default"):
gulp.task('default', ['clean', 'images', 'styles', 'scripts'], function() {
    console.log('starting default task');
});

// Zip the whole project.
gulp.task('export', function () {
    return gulp.src('public/**/*')
        // What the name of the zipped file will be:
        .pipe(zip('exported-website.zip'))
        // Where it will be (root folder):
        .pipe(gulp.dest('./'))
});

// This task, when called, reloads the page every time an HTML file in the "public" folder changes:
gulp.task('html', function() {
    gulp.src('public/*.html')
      .pipe(livereload());
  });

// Watch. (Runs 'default' script before it starts. This ensures that all tasks get recompiled before the Watch task starts, in case any of them have changed since the last time Watch ran):
gulp.task('watch', ['default'], function () {
    console.log('Starting watch task');
    require('./server.js');
    livereload.listen();
    gulp.watch(SCRIPTS_PATH, ['scripts']);
    /*
    Watch task for vanilla CSS:
    gulp.watch(CSS_PATH, ['styles']);
    */
    // Watch task for SASS:
    gulp.watch('public/scss/**/*.scss', ['styles']);
    // Fire the HTML watch task:
    gulp.watch('public/*.html', ['html']);
});