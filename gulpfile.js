var karma = require('gulp-karma');
var less = require('gulp-less');
var path = require('path');
var gulp = require('gulp');


gulp.task('less', function () {
    return gulp.src('src/less/styles.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'src', 'less') ]
        }))
        .pipe(gulp.dest(path.join(__dirname, 'src', 'css')));
});

gulp.task('test', function () {
    return gulp.src([
            "test/*.js",
            "src/js/*.js"
        ])
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'run'
        }))
        .on('error', function (err) {
            // Make sure failed tests cause gulp to exit non-zero
            throw err;
        });
});

gulp.task('watch', function () {
    return gulp.watch(path.join(__dirname, 'src/less/*.less'), ['less']);
});

gulp.task('default', ['watch']);
