const gulp = require('gulp');
const core = require('./node_modules/core/gulp_helper');
const pkg = require('./package.json');
const dir = '/resources/bdit_cot-vfh';
const root = '/scripts';
const rq = require('./node_modules/json5/lib/require.js');

core.embeddedApp.createTasks(gulp, {
  pkg,
  embedArea: 'full',
  environmentOverride: null,
  deploymentPath: '',
  preprocessorContext: {
    local: {},
    dev: {},
    qa: {},
    prod: {}
  }
});
gulp.task('_data', () => {
 let cotuiDEVPath = '/resources/cdn/cotui';
 gulp.src(['node_modules/cotui/dist/**/*']).pipe(gulp.dest('dist' + cotuiDEVPath));
});

gulp.task('lib', () => {
  console.log('adding lib dir');
  return gulp.src(['src/lib/**/*'])
    .pipe(gulp.dest('dist' + dir + root));
});

gulp.task('i18n', () => {
  console.log('adding i18n dir');
  return gulp.src(['src/i18n/*.json'])
    .pipe(gulp.dest('dist' + dir + '/i18n'));
});

gulp.task('settings', () => {
  console.log('adding settings*.js files');
  return gulp.src(['src/scripts/settings*.js'])
    .pipe(gulp.dest('dist' + dir + '/scripts'));
});

gulp.task('data', () => {
  console.log('adding data files');
  return gulp.src(['src/data/*.json'])
    .pipe(gulp.dest('dist' + dir + '/data'));
});

gulp.task('geojson', () => {
  console.log('adding geojson files');
  return gulp.src(['src/geojson/*.geojson'])
    .pipe(gulp.dest('dist' + dir + '/geojson'));
});

gulp.task('topojson', () => {
  console.log('adding topojson files');
  return gulp.src(['src/geojson/*.topojson'])
    .pipe(gulp.dest('dist' + dir + '/geojson'));
});

gulp.task('build', ['_html_styles_scripts', '_images', '_fonts', '_extras', '_bower_extras', '_data', 'lib', 'i18n', 'settings', 'data', 'geojson', 'topojson']);
