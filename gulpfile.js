var less = require('gulp-less');
var path = require('path');
var gulp = require('gulp');

gulp.task('less', function () {
    gulp.src('./src/less/styles.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'src', 'less') ]
        }))
        .pipe(gulp.dest('src/css'));
});