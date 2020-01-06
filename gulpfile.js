const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const sass = require("gulp-sass");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const cache = require("gulp-cache");
const del = require("del");
const runSequence = require("gulp4-run-sequence");
const path = require("path");

const buildPaths = {
  buildFolder: path.join(__dirname, "build"),
  scss: path.join(__dirname, "build", "scss"),
  assets: path.join(__dirname, "build", "assets")
};

const html = () => gulp.src("src/*.html").pipe(gulp.dest(buildPaths.buildFolder));

const scss = (mode = "dev") =>
  gulp
    .src("src/scss/**/*.scss")
    .pipe(sass({ outputStyle: "compressed" }))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest(mode === "production" ? buildPaths.scss : "src/css"))
    .pipe(browserSync.stream());

const images = () =>
  gulp
    .src("src/assets/**/*.+(png|jpg|gif|svg)")
    .pipe(
      cache(
        imagemin(
          [
            imagemin.gifsicle({ interlaced: true, optimizationLevel: 3 }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 7 }),
            imagemin.svgo({
              plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
            })
          ],
          { verbose: true }
        )
      )
    )
    .pipe(gulp.dest(buildPaths.assets));

const buildClean = () => del("build");

const watch = () => {
  browserSync.init({ server: { baseDir: "src" } });

  gulp.watch("src/scss/**/*.scss", scss);
  gulp.watch("src/*.html").on("change", browserSync.reload);
};

const build = callback => runSequence(buildClean, html, () => scss("production"), images, callback);

module.exports = {
  scss,
  watch,
  build
};
