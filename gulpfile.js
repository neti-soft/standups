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

gulp.task('watch', function () {
    gulp.watch(path.join(__dirname, 'src/less/*.less'), ['less']);
});

gulp.task('default', ['watch']);
