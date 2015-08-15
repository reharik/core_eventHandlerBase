/**
 * Created by parallels on 7/21/15.
 */

var gulp = require('gulp');
var del = require('del');




gulp.task('clean', function (cb) {
    del([
        'output/**/*'
    ], cb);
});


gulp.task('publish',['clean'], function () {
    return gulp.src(['src/**/*'], { "base" : "." }).pipe(gulp.dest('output'));
});

gulp.task('default', ['clean','publish']);


