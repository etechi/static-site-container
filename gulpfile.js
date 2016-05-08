var gulp        = require("gulp"),
    source      = require("vinyl-source-stream"),
    buffer      = require("vinyl-buffer"),
    tslint      = require("gulp-tslint"),
    tsc         = require("gulp-typescript"),
    sourcemaps  = require("gulp-sourcemaps"),
    uglify      = require("gulp-uglify"),
    runSequence = require("run-sequence"),
    mocha       = require("gulp-mocha"),
    istanbul    = require("gulp-istanbul");
    
gulp.task("lint", function() {
    return gulp.src([
        "lib/**/**.ts",
        "test/**/**.test.ts"
    ])
    .pipe(tslint({ }))
    .pipe(tslint.report("verbose"));
});



gulp.task("build", function() {
    var tsProject = tsc.createProject("tsconfig.json");
    return gulp.src([
            "lib/*.ts"
        ])
        .pipe(sourcemaps.init()) 
        .pipe(tsc(tsProject))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("lib"));
});
gulp.task("build-test", function() {
    var tsProject = tsc.createProject("tsconfig.json");
    return gulp.src([
            "test/*.ts"
        ])
        .pipe(sourcemaps.init()) 
        .pipe(tsc(tsProject))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("test"));
});

gulp.task("test", ["build","build-test"],function() {
    return gulp.src('test/*.js', {read: false})
        // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha({reporter: 'nyan', useColors: false}));
});


gulp.task("watch", ["default"], function () {
    gulp.watch([ "lib/**.ts"], ["default"]);
});