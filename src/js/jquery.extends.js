/**
 * jQuery扩展函数
 * Created by Administrator on 2017-4-10.
 */
(function (window, document, $) {
  'use strict'
  $.extend({
    /**
     * restful方式ajax
     * @param settings
     */
    ajaxRestful: function (settings) {
      if (!settings.url) return
      var layerIndex
      var defaults = {
        url: '',
        data: {},
        type: 'POST',
        dataType: 'JSON',
        timeout: 30000,
        beforeSend: function () {
          layerIndex = common.loading()
        },
        success: $.noop,
        complete: function () {
          if (layerIndex) common.unloading(layerIndex)
        },
        error: function () {
          common.tips('网络连接错误')
        }
      }
      var options = $.extend(defaults, settings || {})
      return $.ajax({
        url: options.url,
        data: options.data,
        type: options.type,
        dataType: options.dataType,
        contentType: 'application/json; charset=utf-8',
        timeout: options.timeout,
        beforeSend: options.beforeSend,
        success: options.success,
        complete: options.complete,
        error: options.error
      })
    },

    /**
     * 数据以formData的方式的ajax
     * @param settings
     * @returns {*}
     */
    ajaxFormData: function (settings) {
      if (!settings.url) return
      var layerIndex
      var defaults = {
        url: '',
        data: {},
        type: 'POST',
        dataType: 'JSON',
        timeout: 30000,
        beforeSend: function () {
          layerIndex = common.loading()
        },
        success: $.noop,
        complete: function () {
          if (layerIndex) common.unloading(layerIndex)
        },
        error: function () {
          common.tips('网络连接错误')
        }
      }
      var options = $.extend(defaults, settings || {})

      var formData = new FormData()
      if (options.data) {
        for (var k in options.data) {
          formData.append(k, options.data[k])
        }
      }

      return $.ajax({
        url: options.url,
        data: formData,
        type: options.type,
        dataType: options.dataType,
        timeout: options.timeout,
        cache: false,
        processData: false, // 告诉jQuery不要去处理发送的数据
        contentType: false, // 告诉jQuery不要去设置Content-Type请求头
        beforeSend: options.beforeSend,
        success: options.success,
        complete: options.complete,
        error: options.error
      })
    },

    /**
     * 公共ajax
     * @param settings
     */
    ajaxCommon: function (settings) {
      if (!settings.url) return
      var layerIndex
      var defaults = {
        url: '',
        data: {},
        type: 'POST',
        dataType: 'JSON',
        timeout: 30000,
        beforeSend: function () {
          layerIndex = common.loading()
        },
        success: $.noop,
        complete: function () {
          if (layerIndex) common.unloading(layerIndex)
        },
        error: function () {
          common.tips('网络连接错误')
        }
      }
      var options = $.extend(defaults, settings || {})
      return $.ajax({
        url: options.url,
        data: options.data,
        type: options.type,
        dataType: options.dataType,
        timeout: options.timeout,
        beforeSend: options.beforeSend,
        success: options.success,
        complete: options.complete,
        error: options.error
      })
    },

    /**
     * 窗口滚动监听
     * @param settings
     */
    scrollListener: function (settings) {
      var defaults = {
        body: '.p-body',
        offsetHeight: 40 // 高度偏移量
      }
      var options = $.extend(defaults, settings || {})

      var $window = $(window)
      var $body = $(options.body)
      var beforeScrollTop = $window.scrollTop()
      var windowHeight = $window.height()
      var bodyHeight = $body.outerHeight()

      console.log(beforeScrollTop, windowHeight, bodyHeight)

      /*---- 添加事件----*/
      $window.on('scroll', function () {
        var afterScrollTop = $(this).scrollTop()
        var delta = afterScrollTop - beforeScrollTop
        var direction = delta >= 0 ? 'down' : 'up'
        // 滚动方向为向下时
        if (direction == 'down') {
          if (afterScrollTop >= bodyHeight - windowHeight - options.offsetHeight) {
            $window.trigger('bottom.scroll')
          }
        }
        beforeScrollTop = afterScrollTop
      })
    },

    /**
     * 异步加载图片
     * @param src
     * @returns {*}
     */
    loadImage: function (src) {
      var image = new Image()
      var def = $.Deferred()

      image.onload = function () {
        def.resolve(image)
      }

      image.error = function () {
        def.reject('图片加载失败')
      }

      image.src = src

      return def.promise()
    },
  })

  $.fn.extend({
    /**
     * 将表单转换为json对象
     * @returns {{}}
     */
    serializeJSON: function (settings) {

      var defaults = {
        ignores: []
      }
      var options = $.extend(defaults, settings || {})

      var $form = $(this)
      var dataArray = $form.serializeArray()

      var jsonObject = {}
      for (var key in dataArray) {
        if (options.ignores.indexOf(dataArray[key].name) < 0) {
          if (!!jsonObject[dataArray[key].name]) {
            //jsonObject[dataArray[key].name] instanceof Array ? jsonObject[dataArray[key].name].push(dataArray[key].value) : jsonObject[dataArray[key].name] = new Array(jsonObject[dataArray[key].name].value).push(dataArray[key].value);
            jsonObject[dataArray[key].name] += ',' + dataArray[key].value
          } else {
            jsonObject[dataArray[key].name] = dataArray[key].value
          }
        }
      }

      return jsonObject
    },

    /**
     * 验证表单
     *
     * rules
     *   required: 是否必须。true or false
     *   type: 值类型。目前包含 number=>数字 integer=>整数 mobile=>手机号码
     *   min: 最小值。type==number||integer 时有效
     *   max: 最大值。type==number||integer 时有效
     *   minLength: 最小长度
     *   maxLength: 最大长度
     *   fixed: 小数点位。仅type==number 时有效
     *
     * @param settings
     * @returns {boolean}
     */
    validate: function (settings) {

      var defaults = {
        rules: {},
        messages: {},
        onValid: function (form) {}, // 验证通过时
        onInvalid: function (form, error) {} // 验证不通过时，error包含target跟message
      }
      var options = $.extend(defaults, settings || {})

      var $form = $(this)
      var rules = options.rules
      var messages = options.messages
      var isValid = true
      var _patterns = {
        number: /^-?\d+(\.\d+)?$/,
        integer: /^-?\d+$/,
        mobile: /^((\+86)|(86))?1(3|4|5|7|8)\d{9}$/
      }

      var _functions = {
        // 验证不通过统一处理函数
        _invalid: function (error) {
          //console.log(error);
          isValid = false
          options.onInvalid($form, error)
        },
        // 验证是否是数字
        _isNumber: function (val) {
          return _patterns.number.test(val)
        },
        // 验证小数点后N位
        _isFixed: function (val, fixedNumber) {
          var _reg
          if (fixedNumber <= 0) {
            _reg = new RegExp('^-?\\d+$')
          } else if (fixedNumber == 1) {
            _reg = new RegExp('^-?\\d+(\\.\\d)?$')
          } else {
            _reg = new RegExp('^-?\\d+(\\.\\d{1,' + fixedNumber + '})?$')
          }

          return _reg.test(val)
        },
        // 验证是否是整数
        _isInteger: function (val) {
          return _patterns.integer.test(val)
        },
        _isMobile: function (val) {
          return _patterns.mobile.test(val)
        },
        // 验证第一个参数是否大于第二个参数
        _isGreaterThan: function (val1, val2) {
          var v1 = parseFloat(val1)
          var v2 = parseFloat(val2)
          return v1 >= v2
        }
      }

      // 循环验证
      for (var name in rules) {
        var $_input = $form.find('[name="' + name + '"]')
        if (!$_input || $_input.length <= 0 || $_input.is(':disabled')) continue
        var validateValue = $_input.is(':radio') || $_input.is(':checkbox') ? $_input.filter(':checked').val() : $_input.val()
        var isRequired = rules[name] === 'required' || rules[name].required // 是否必须
        var type = rules[name].type // 验证规则类型
        var pattern = rules[name].pattern // 正则
        var min, // 最小值
          max, // 最大值
          minLength, // 最小字符串长度
          maxLength, // 最大字符串长度
          fixed // 小数点位

        // 如果必须
        if (isRequired && !validateValue) {
          _functions._invalid({
            target: $_input,
            message: typeof messages[name] === 'string' ? messages[name] : messages[name].required
          })
          break
        }

        // 手机号码
        if (!!type && typeof type === 'string' && (type == 'mobile')) {
          if (!_functions._isMobile(validateValue)) {
            _functions._invalid({
              target: $_input,
              message: messages[name].type || '请输入正确的手机号码'
            })
            break
          }
        }

        // 值类型
        if (!!type && typeof type === 'string' && (type == 'number' || type == 'integer')) {
          if (type == 'number') {
            // 数字
            if (!_functions._isNumber(validateValue)) {
              _functions._invalid({
                target: $_input,
                message: messages[name].type || '请输入正确的数字'
              })
              break
            }

            // 小数点后N位数字
            fixed = rules[name].fixed
            if ((fixed || fixed == 0) && !_functions._isFixed(validateValue, fixed)) {
              _functions._invalid({
                target: $_input,
                message: messages[name].fixed || '请输入保留小数点后' + fixed + '位数字'
              })
              break
            }
          } else if (type == 'integer') {
            // 整数
            if (!_functions._isInteger(validateValue)) {
              _functions._invalid({
                target: $_input,
                message: messages[name].type || '请输入正确的整数'
              })
              break
            }
          }

          // 最小值、最大值
          min = rules[name].min
          max = rules[name].max

          if ((min || min == 0) && (max || max == 0)) {
            // 如果最小值大于最大值，不验证
            if (_functions._isGreaterThan(min, max)) {
              continue
            }
          }

          if (min || min == 0) {
            if (!_functions._isGreaterThan(validateValue, min)) {
              _functions._invalid({
                target: $_input,
                message: messages[name].min || '请输入大于' + min + '的数字'
              })
              break
            }
          }

          if (max || max == 0) {
            if (_functions._isGreaterThan(validateValue, max)) {
              _functions._invalid({
                target: $_input,
                message: messages[name].max || '请输入小于' + max + '的数字'
              })
              break
            }
          }
        }

        // 字符串长度
        minLength = rules[name].minLength
        maxLength = rules[name].maxLength

        if (((minLength && minLength > 0) || minLength == 0) && ((maxLength && maxLength > 0) || maxLength == 0)) {
          // 如果最小长度大于最大长度，不验证
          if (_functions._isGreaterThan(minLength, maxLength)) {
            continue
          }
        }

        if ((minLength && minLength > 0) || minLength == 0) {

          if (!_functions._isGreaterThan(validateValue.toString().length, minLength)) {
            _functions._invalid({
              target: $_input,
              message: messages[name].minLength || '请输入最少' + minLength + '个字'
            })
            break
          }
        }

        if ((maxLength && maxLength > 0) || maxLength == 0) {
          if (_functions._isGreaterThan(validateValue.toString().length, maxLength)) {
            _functions._invalid({
              target: $_input,
              message: messages[name].maxLength || '请输入最多' + maxLength + '个字'
            })
            break
          }
        }

        // 如果有正则验证
        if (!!pattern) {
          var reg = pattern instanceof RegExp ? pattern : new RegExp(pattern)
          if (!reg.test(validateValue)) {
            _functions._invalid({
              target: $_input,
              message: messages[name].pattern || '格式不正确'
            })
            break
          }
        }

      }

      // 如果通过验证
      if (isValid) {
        options.onValid($form)
        return true
      } else {
        return false
      }
    },

    /**
     * 模态框
     * @param settings
     * @returns {*|HTMLElement}
     */
    modal: function (settings) {
      var $modal = $(this)

      var showModal = function () {
        $modal.show()
        $modal.trigger('shown.modal')
      }

      var hideModal = function () {
        $modal.hide()
        $modal.trigger('hidden.modal')
      }

      if (typeof settings == 'string') {
        if (settings == 'show') {
          showModal()
        } else if (settings == 'hide') {
          hideModal()
        }
      }

      return $modal
    },

    /**
     * 折叠
     * @param settings
     */
    collapse: function (settings) {
      var defaults = {
        activeClass: 'z-active'
      }
      var options = $.extend(defaults, settings || {})

      var $target = $(this)
      if ($target.is(':hidden')) {
        $target.slideDown('fast', function () {
          $target.addClass(options.activeClass)
          $target.trigger('shown.collapse')
        })
        $target.trigger('show.collapse')
      } else {
        $target.slideUp('fast', function () {
          $target.removeClass(options.activeClass)
          $target.trigger('hidden.collapse')
        })
        $target.trigger('hide.collapse')
      }

      return $target
    },

    /**
     * 图片自动居中
     * @returns {*|HTMLElement}
     */
    autoCenter: function () {
      var $img = $(this)
      var $parent = $img.parent()
      var src = $img.attr('src')

      // 获取图片在canvas中的宽高和位置
      function fixImageSize (imageWidth, imageHeight, parentWidth, parentHeight) {
        var _width, _height, _px = 0,
          _py = 0

        if (imageWidth > 0 && imageHeight > 0) {

          if (imageWidth / imageHeight >= parentWidth / parentHeight) {

            if (imageWidth > parentWidth) {

              _width = (imageWidth * parentHeight) / imageHeight
              _height = parentHeight
            } else {

              _width = imageWidth
              _height = imageHeight
            }
          } else {

            if (imageHeight > parentHeight) {

              _width = parentWidth
              _height = (imageHeight * parentWidth) / imageWidth
            } else {

              _width = imageWidth
              _height = imageHeight
            }
          }
        }
        _width = parseInt(_width)
        _height = parseInt(_height)
        _px = parseInt((parentWidth - _width) / 2)
        _py = parseInt((parentHeight - _height) / 2)
        return {
          width: _width,
          height: _height,
          x: _px,
          y: _py
        }
      }

      $.loadImage(src).done(function (image) {
        var naturalWidth = image.naturalWidth
        var naturalHeight = image.naturalHeight
        var parentWidth = $parent.width()
        var parentHeight = $parent.height()
        var imageSize = fixImageSize(naturalWidth, naturalHeight, parentWidth, parentHeight)
        var imageCss

        $parent.css({
          position: 'relative'
        })

        imageCss = {
          position: 'absolute',
          left: imageSize.x + 'px',
          top: imageSize.y + 'px'
        }

        if (imageSize.width > parentWidth) {
          $.extend(imageCss, {
            maxWidth: 'none',
            width: 'auto',
            maxHeight: '100%'
          })
        } else {
          $.extend(imageCss, {
            maxWidth: '100%',
            height: 'auto',
            maxHeight: 'none'
          })
        }

        $img.attr({
          width: naturalWidth,
          height: naturalHeight
        }).css(imageCss)
      })

      return $img
    },

    /**
     * 图片延迟加载
     * @returns {*}
     */
    lazyLoad: function () {
      var $img = $(this)
      if (!$img.is('img')) return

      var def = $.Deferred()
      var src = $img.data('src')

      $.loadImage(src).done(function (image) {

        $img.attr('src', image.src)
        def.resolve()
      }).fail(function (msg) {
        def.reject(msg)
      })

      return def.promise()
    },

    /**
     * 背景图片延迟加载
     * @returns {*}
     * @constructor
     */
    backgroundLazyLoad: function () {
      var $ele = $(this)

      var def = $.Deferred()
      var src = $ele.data('src')

      $.loadImage(src).done(function (image) {
        $ele.css({
          backgroundImage: 'url(' + image.src + ')'
        })
        def.resolve()
      }).fail(function (msg) {
        def.reject('背景图片加载失败')
      })

      return def.promise()
    }
  })

  $(function () {
    //FastClick.attach(document.body);

    // 打开modal
    $(document).off('click', '[data-toggle="modal"]').on('click', '[data-toggle="modal"]', function () {
      var $ele = $(this)
      var $target = $($ele.data('target'))
      var isShadeClose = $($ele.data('shade-close'))

      $target.modal('show')

      if (isShadeClose) {
        $target.off('click').on('click', function (e) {
          if ($target.is($(e.target))) {
            $target.modal('hide')
          }
        })
      }
      return false
    })
    // 关闭modal
      .off('click', '[data-close-modal]').on('click', '[data-close-modal]', function () {
      var $ele = $(this)
      var $target = $($ele.data('close-modal'))

      $target.modal('hide')

      return false
    })
    // 折叠
      .off('click', '[data-toggle="collapse"]').on('click', '[data-toggle="collapse"]', function () {
      var $ele = $(this)
      var $target = $($ele.data('target'))
      $target.collapse()
      return false
    })

    // modal弹窗，禁止页面滚动
    $('[class*="m-modal"]:not([scroll])').on('touchmove', function (event) {
      return false
    })

    // 图片延迟加载
    $('[data-toggle="lazyLoad"]').each(function () {
      var $img = $(this)
      var autoCenter = $img.data('auto-center')
      $img.lazyLoad().done(function () {
        if (autoCenter) {
          $img.autoCenter()
        }
      })
    })

    // 背景图片延迟加载
    $('[data-toggle="bgLazyLoad"]').each(function () {
      $(this).backgroundLazyLoad()
    })
  })
})(window, document, jQuery)
