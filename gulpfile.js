var gulp = require('gulp');
var mocha = require('gulp-mocha');
var path = require('path');
var spawn = require('child_process').spawn;

gulp.task('test:unit', function () {
    return gulp.src('test/unit/**/*.js', {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('test:int', function () {
    return gulp.src('test/integration/**/*.js', {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('test:unit:debug', function (cb) {
    spawn('node', [
        '--debug-brk',
        path.join(__dirname, 'node_modules/gulp/bin/gulp.js'),
        'test:unit'
    ], { stdio: 'inherit' });
});

gulp.task('test:int:debug', function (cb) {
    spawn('node', [
        '--debug-brk',
        path.join(__dirname, 'node_modules/gulp/bin/gulp.js'),
        'test:int'
    ], { stdio: 'inherit' });
});