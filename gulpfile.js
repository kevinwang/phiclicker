'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var source = require('vinyl-source-stream');

// JavaScript packages located in javascript directory
var packages = [
    'remote-package'
];

// Create a task for each package
packages.forEach(function(pkg) {
    gulp.task(pkg, function(){
        console.log('Bundling javascript/' + pkg + ' -> public/js/' + pkg + '.js');
        var b = browserify({
            entries: 'javascript/' + pkg + '/index.js',
            debug: true
        });
        b.bundle()
        .pipe(source(pkg + '.js'))
        .pipe(gulp.dest('public/js'));
    });
});

// Automatically rebuild packages when source files are modified
gulp.task('watchjs', function() {
    packages.forEach(function(pkg) {
        gulp.watch('javascript/' + pkg + '/*', [pkg]);
    });
});

// Build all JavaScript packages
gulp.task('build', packages);

// Run backend
gulp.task('server', function() {
    nodemon({
        script: 'app.js',
        ignore: ['javascript', 'public']
    });
});

gulp.task('default', ['watchjs', 'server'].concat(packages));
