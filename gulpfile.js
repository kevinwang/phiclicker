'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var source = require('vinyl-source-stream');

gulp.task('javascript', function(){
    var destDir = 'public/js';
    var packages = [
        'remote'
    ];

    var bundleThis = function(srcArray) {
        srcArray.forEach(function(src) {
            console.log('Bundling javascript/' + src + '-package -> public/js/' + src + '.js');
            var b = browserify({
                entries: 'javascript/' + src + '-package/index.js',
                debug: true
            });
            b.bundle()
            .pipe(source(src + '.js'))
            .pipe(gulp.dest(destDir));
        });
    };

    bundleThis(packages);
});

gulp.task('watchjs', function() {
    gulp.watch('javascript/**/*', ['javascript']);
});

gulp.task('server', function() {
    nodemon({
        script: 'app.js'
    });
});

gulp.task('default', ['watchjs', 'server']);
