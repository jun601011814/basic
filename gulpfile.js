const gulp = require('gulp')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const str2hex = require('gulp-str2hex')
const minifyCss = require('gulp-clean-css')
const sass = require('gulp-sass')
const autoprefixer = require('autoprefixer')
const postcss = require('gulp-postcss')
const px2rem = require('postcss-px2rem')
const imagemin = require('gulp-imagemin')
const pngquant = require('imagemin-pngquant')
const cache = require('gulp-cache')
const concat = require('gulp-concat')
const rev = require('gulp-rev')
const revCollector = require('gulp-rev-collector')
const rename = require('gulp-rename')
const clean = require('gulp-clean')
const replace = require('gulp-replace')

const paths = {
  clean: 'dist',
  src: {
    scripts: ['src/js/**/*.js'],
    styles: ['src/scss/*.scss'],
    pageStyles: ['src/scss/page/**/*.scss'],
    images: ['src/images/**/*.{png,jpg,gif,ico}'],
    html: ['src/*.html']
  },
  dist: {
    scripts: 'dist/js',
    styles: 'dist/css',
    images: 'dist/images',
    html: 'dist'
  }
}

// 清除文件夹
gulp.task('clean', function () {
  return gulp.src(paths.clean, {read: false})
    .pipe(clean())
})

// 转换压缩js文件
gulp.task('scripts', function () {
  return gulp.src(paths.src.scripts)
    .pipe(babel())
    .pipe(gulp.dest(paths.dist.scripts))
    .pipe(uglify())
    // 开启hex转码
    // .pipe(str2hex({
    //     hexall: false, // 是否转换英文
    //     placeholdMode: 2,
    //     compress: true
    // }))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(paths.dist.scripts))
})

// 转换压缩样式文件
gulp.task('styles', function () {
  const processors = [
    px2rem({remUnit: 75}),
    autoprefixer({
      browsers: ['last 4 versions', 'Android >= 4.0']
    })
  ]
  gulp.src(paths.src.pageStyles, {base: 'src/scss'})
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(gulp.dest(paths.dist.styles))
    .pipe(minifyCss())
    .pipe(rename({suffix: '.min'}))
    // .pipe(rev())
    .pipe(gulp.dest(paths.dist.styles))
    // .pipe(rev.manifest())
    // .pipe(gulp.dest('dist/rev'));

  return gulp.src(paths.src.styles, {base: 'src/scss'})
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(concat('global.css'))
    .pipe(gulp.dest(paths.dist.styles))
    .pipe(minifyCss())
    .pipe(rename({suffix: '.min'}))
    // .pipe(rev())
    .pipe(gulp.dest(paths.dist.styles))
    // .pipe(rev.manifest())
    // .pipe(gulp.dest('dist/rev'));
})

// 转换压缩图片
gulp.task('images', function () {
  return gulp.src(paths.src.images)
    .pipe(cache(imagemin({
      progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
      svgoPlugins: [{removeViewBox: false}],//不要移除svg的viewbox属性
      use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
    })))
    .pipe(gulp.dest(paths.dist.images))
})

// 压缩html
gulp.task('html', function () {
  return gulp.src(paths.src.html)
    .pipe(replace(/<link\s*.*href=".*(\.scss)"\s*.*\/?>/g, function (match) {
      return match.replace(/\/scss\//g, '/css/').replace(/\.scss/g, '.min.css')
    }))
    .pipe(gulp.dest(paths.dist.html))
})

gulp.task('watch', function () {
  // 监听文件
  gulp.watch([
    ...paths.src.scripts,
    ...paths.src.styles,
    ...paths.src.images,
    ...paths.src.html,
  ], ['default'])
})

gulp.task('default', ['clean'], function () {
  gulp.start(['html', 'styles', 'scripts', 'images'])
  // gulp.start('rev')
})

