const gulp = require('gulp');
const runSequence = require('run-sequence');
const core = require('./node_modules/core/gulp_helper');
const pkg = require('./package.json');
const babel = require('gulp-babel');

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

gulp.task('lib', () => {
  console.log('adding lib dir');
  let dir = '/webapps/bdit_cot-vfh';
  return gulp.src(['src/lib/**/*'])
    .pipe(gulp.dest('dist' + dir + '/lib'));
});

gulp.task('i18n', () => {
  console.log('adding i18n dir');
  let dir = '/webapps/bdit_cot-vfh';
  return gulp.src(['src/i18n/*.json'])
    .pipe(gulp.dest('dist' + dir + '/i18n'));
});

gulp.task('settings', () => {
  console.log('adding settings*.js files');
  let dir = '/webapps/bdit_cot-vfh';
  return gulp.src(['src/scripts/settings*.js'])
    .pipe(gulp.dest('dist' + dir + '/scripts'));
});

gulp.task('data', () => {
  console.log('adding data files');
  let dir = '/webapps/bdit_cot-vfh';
  return gulp.src(['src/data/*.json'])
    .pipe(gulp.dest('dist' + dir + '/data'));
});

gulp.task('indexjs', () => {
  console.log('adding index.js');
  let dir = '/webapps/bdit_cot-vfh';
  return gulp.src(['src/scripts/index.js'])
    .pipe(gulp.dest('dist' + dir + '/scripts'));
});

// gulp.task('foo_run', () => {
//   return new Promise(resolve => {
//     runSequence('clean', 'build_with_simulator', 'lib', '_serve', resolve);
//   });
// });

gulp.task('build', ['_html_styles_scripts', '_images', '_fonts', '_extras', '_bower_extras', '_data', 'lib', 'i18n', 'settings', 'data', 'indexjs']);
