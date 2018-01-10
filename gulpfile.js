var gulp = require('gulp');
var pump = require('pump');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");

gulp.task('weevar', function (cb) {
    pump([
            gulp.src('src/weevar.js'),
            uglify(),
            rename("weevar.min.js"),
            gulp.dest('build')
        ],
        cb
    );
});

gulp.task('watch', ['weevar'], function() {
    gulp.watch('./src/*.js', ['weevar']);
});

gulp.task('default', ['weevar']);