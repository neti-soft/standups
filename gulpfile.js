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

gulp.task('copy-components', function () {
    //styles
    var styles = [
        "./src/components/font-awesome/css/font-awesome.css"
    ];
    gulp.src(styles).pipe(gulp.dest('./src/css/'));

    var fonts = [
        "./src/components/font-awesome/fonts/*.*"
    ];
    gulp.src(fonts).pipe(gulp.dest('./src/fonts/'));
});

gulp.task('build', function () {
    gulp.src([
        "src/css/**/*.*",
        "src/fonts/**/*.*",
        "src/js/**/*.*",
        "src/js/components/angular/angular.js",
        "src/js/components/jquery/dist/jquery.js",
        "src/img/**/*.*",
        "src/templates/index.html",
        "src/background.html",
        "src/manifest.json"
    ], { base: './src' }).pipe(gulp.dest('./dist'));
});

gulp.task('watch', function () {
    return gulp.watch(path.join(__dirname, 'src/less/*.less'), ['less']);
});

gulp.task('default', ['watch']);
