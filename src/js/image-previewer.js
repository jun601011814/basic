/**
 * 图片预览
 * Created by Administrator on 2016-7-7.
 */
(function (window, $) {
  'use strict'

  var tips = (function () {
    var index,
      defaultText = '正在加载中...'
    return {
      show: function (msg, cb) {
        msg = msg || defaultText
        cb = cb && cb instanceof Function ? cb : function (e) {}
        index = layer.msg(msg, {
          time: 0,
          shade: [
            0.3,
            '#000'
          ]
        }, cb)
      },
      hide: function () {
        if (index) {
          layer.close(index)
        } else {
          layer.closeAll()
        }
      }
    }
  })()

  // 异步读取图片
  var loadImage = function (src) {
    var image = new Image()
    var def = $.Deferred()

    image.onload = function () {
      def.resolve(image)
    }

    image.error = function () {
      def.reject('加载图片失败')
    }

    image.src = src

    return def.promise()
  }

  // 获取图片在canvas中的宽高和位置
  var fixImageSize = function (imageWidth, imageHeight, canvasWidth, canvasHeight) {
    var _width, _height, _px, _py

    if (imageWidth > 0 && imageHeight > 0) {
      if (imageWidth / imageHeight >= canvasWidth / canvasHeight) {
        if (imageWidth > canvasWidth) {
          _width = canvasWidth
          _height = (imageHeight * canvasWidth) / imageWidth
        } else {
          _width = imageWidth
          _height = imageHeight
        }
      } else {
        if (imageHeight > canvasHeight) {
          _height = canvasHeight
          _width = (imageWidth * canvasHeight) / imageHeight
        } else {
          _width = imageWidth
          _height = imageHeight
        }
      }
    }
    _width = parseInt(_width)
    _height = parseInt(_height)
    _px = parseInt((canvasWidth - _width) / 2)
    _py = parseInt((canvasHeight - _height) / 2)

    return {
      width: _width,
      height: _height,
      x: _px,
      y: _py
    }
  }

  // 重新计算并设置canvas的宽高
  var resetCanvasSize = function (canvas, maxWidth, srcWidth, srcHeight, cb) {

    var _width = 0,
      _height = 0

    if (maxWidth > 0 && srcWidth > 0 && srcHeight > 0) {

      _width = maxWidth
      if (srcWidth >= maxWidth) {

        _height = (srcHeight * maxWidth) / srcWidth
      } else {

        _height = srcHeight
      }

      canvas.width = _width
      canvas.height = _height

      if (cb && cb instanceof Function) {
        cb({
          width: _width,
          height: _height
        })
      }
    }
  }

  var _ImagePreviewer = function (canvasSelector, width, height) {
    this.canvas = null
    this.ctx = null
    this.offScreenCanvas = null // 离屏canvas
    this.offScreenCtx = null
    this.width = width || 0
    this.height = height || 0
    this.orientation = 1 // 图片的方向信息

    this.autoSize = false // 是否自动
    this.onUpdateSize = null // 尺寸更新回调，autoSize为true才会调用

    if (canvasSelector) {
      this.canvas = document.querySelector(canvasSelector)
      this.init()
    }
  }

  // 初始化
  _ImagePreviewer.prototype.init = function () {
    this.ctx = this.canvas.getContext('2d')
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.offScreenCanvas = document.createElement('canvas') // 离屏canvas
    this.offScreenCtx = this.offScreenCanvas.getContext('2d')
    this.offScreenCanvas.width = 0
    this.offScreenCanvas.height = 0

    this.ctx.backgroundAlpha = 0
    this.offScreenCtx.backgroundAlpha = 0
  }

  // 清除屏内canvas
  _ImagePreviewer.prototype.clearCanvas = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  // 清除离屏canvas
  _ImagePreviewer.prototype.clearOffCanvas = function () {
    this.offScreenCtx.clearRect(0, 0, this.offScreenCanvas.width, this.offScreenCanvas.height)
  }

  // 将离屏canvas的内容绘制到屏内canvas中
  _ImagePreviewer.prototype.render = function () {
    var def = $.Deferred(),
      self = this,
      pos = {},
      canvas = this.canvas,
      offCanvas = this.offScreenCanvas,
      width = offCanvas.width,
      height = offCanvas.height

    try {
      if (self.autoSize) {

        resetCanvasSize(canvas, self.width, width, height, self.onUpdateSize)
      }
      pos = fixImageSize(width, height, canvas.width, canvas.height)

      self.clearCanvas()
      self.ctx.save()
      self.ctx.drawImage(offCanvas, 0, 0, width, height, pos.x, pos.y, pos.width, pos.height)
      self.ctx.restore()
      //self.clearOffCanvas();
      def.resolve()
    } catch (e) {

      def.reject()
    }

    return def.promise()
  }

  //---- 所有的绘制都在离屏canvas中进行

  // 绘制内容
  _ImagePreviewer.prototype.draw = function (src) {
    var self = this,
      ctx = self.offScreenCtx,
      canvas = self.offScreenCanvas,
      def = $.Deferred()
    loadImage(src).done(function (image) {
      var pos = {},
        width = image.naturalWidth,
        height = image.naturalHeight

      if (self.orientation > 4) {
        canvas.height = width
        canvas.width = height
      } else {
        canvas.width = width
        canvas.height = height
      }

      self.clearOffCanvas()
      ctx.save()
      switch (self.orientation) {
        case 2:
          // horizontal flip
          ctx.translate(width, 0)
          ctx.scale(-1, 1)
          break
        case 3:
          // 180° rotate left
          ctx.translate(width, height)
          ctx.rotate(Math.PI)
          break
        case 4:
          // vertical flip
          ctx.translate(0, height)
          ctx.scale(1, -1)
          break
        case 5:
          // vertical flip + 90 rotate right
          ctx.rotate(0.5 * Math.PI)
          ctx.scale(1, -1)
          break
        case 6:
          // 90° rotate right
          ctx.rotate(0.5 * Math.PI)
          ctx.translate(0, -height)
          break
        case 7:
          // horizontal flip + 90 rotate right
          ctx.rotate(0.5 * Math.PI)
          ctx.translate(width, -height)
          ctx.scale(-1, 1)
          break
        case 8:
          // 90° rotate left
          ctx.rotate(-0.5 * Math.PI)
          ctx.translate(-width, 0)
          break
        default:
          break
      }
      ctx.drawImage(image, 0, 0)
      ctx.restore(pos)

      // 重绘到屏内canvas
      self.render().done(function () {

        def.resolve()
      }).fail(function () {

        def.reject()
      })
    })

    return def.promise()
  }

  // 从文件流中获取文件的dataURL
  _ImagePreviewer.prototype.getDataURLFromFiles = function (files) {
    var self = this,
      exts = ('.gif,.jpg,.jpeg,.bmp,.png').split(','),
      def = $.Deferred(),
      file, fileExt

    if (files.length == 0 ||
      (file = files[0], fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase(), exts.indexOf(fileExt) < 0) ||
      (!/image\/\w+/.test(file.type))) {

      def.reject('图片不存在或者格式不正确')
      return def.promise()
    }

    if (EXIF) {
      EXIF.getData(file, function () {
        EXIF.getAllTags(this)
        self.orientation = EXIF.getTag(this, 'Orientation')
      })
    }

    var fileReader = new FileReader()
    fileReader.onload = function (e) {
      fileReader = null
      def.resolve(e.target.result)
    }

    fileReader.readAsDataURL(file)

    return def.promise()
  }

  // 将canvas内容转换成base64图片
  _ImagePreviewer.prototype.toBase64Image = function () {

    var pic = this.canvas.toDataURL('image/png')
    pic = pic.replace(/^data:image\/(png|jpg);base64,/, '')

    return pic
  }

  // 预览图片
  _ImagePreviewer.prototype.preview = function (files) {
    var self = this,
      def = $.Deferred()

    tips.show()
    self.getDataURLFromFiles(files).done(function (src) {
      self.draw(src).done(function () {

        def.resolve()
      }).fail(function () {

        def.reject()
      }).always(function () {

        tips.hide()
      })
    }).fail(function () {

      tips.hide()
    })

    return def.promise()
  }

  window.ImagePreviewer = _ImagePreviewer
})(window, jQuery)
