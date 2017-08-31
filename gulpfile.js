'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const str2hex = require('gulp-str2hex');
const minifyCss = require('gulp-clean-css');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const cache = require('gulp-cache');
const concat = require('gulp-concat');
const rev = require('gulp-rev');
const revCollector = require('gulp-rev-collector');
const rename = require('gulp-rename');
const clean = require('gulp-clean');

// 清除script文件夹
gulp.task('cleanScripts', function () {
    return gulp.src(['dist/js'], { read: false })
        .pipe(clean());
});

// 清除css文件夹
gulp.task('cleanCss', function () {
    return gulp.src(['dist/css'], { read: false })
        .pipe(clean());
        // .pipe(notify({ message: '文件清除成功' }));
});

// 清除images文件夹
gulp.task('cleanImages', function () {
    return gulp.src(['dist/images'], { read: false })
        .pipe(clean());
});

// 清除html文件
gulp.task('cleanHtml', function () {
    return gulp.src(['dist/*.html'], { read: false })
        .pipe(clean());
});

// 转换压缩js文件
gulp.task('scripts', ['cleanScripts'], function () {
    return gulp.src('src/js/**/*.js')
        .pipe(babel())
        // .pipe(gulp.dest('dist/js'))
        .pipe(uglify())
        // 开启hex转码
        // .pipe(str2hex({
        //     hexall: false, // 是否转换英文
        //     placeholdMode: 2,
        //     compress: true
        // }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist/js'));
});

// 转换压缩样式文件
gulp.task('styles', ['cleanCss'], function () {
    return gulp.src(['src/scss/**/*.scss'], { base: 'css' })
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 4 versions', 'Android >= 4.0']
        }))
        .pipe(concat('style.css'))
        // .pipe(gulp.dest('dist/css'))
        .pipe(minifyCss())
        .pipe(rename({suffix: '.min'}))
        .pipe(rev())
        .pipe(gulp.dest('dist/css'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/rev'));
});

// 转换压缩图片
gulp.task('images', ['cleanImages'], function () {
    return gulp.src('src/images/**/*.{png,jpg,gif,ico}')
        .pipe(cache(imagemin({
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            svgoPlugins: [{ removeViewBox: false }],//不要移除svg的viewbox属性
            use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
        })))
        .pipe(gulp.dest('dist/images'));
});

// 压缩html
gulp.task('html', ['cleanHtml'], function () {
    return gulp.src('src/*.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('rev', function () {
    return gulp.src(['./dist/rev/*.json', './dist/*.html'])
        .pipe(revCollector())
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['build'], function () {
    // 监听文件
    gulp.watch([
        'src/js/**/*.js',
        'src/scss/**/*.scss',
        'src/images/**/*.{png,jpg,gif,ico}',
        'src/*.html'
    ], ['build']);
});

gulp.task('build', ['scripts', 'styles', 'images', 'html'], function () {
    gulp.start('rev')
});