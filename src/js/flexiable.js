(function (window, document) {

  let dpr
  let rem
  let scale
  let metaEl = document.querySelector('meta[name="viewport"]')
  const docEl = document.documentElement

  if (!metaEl) {
    metaEl = document.createElement('meta')
    metaEl.setAttribute('name', 'viewport')
    metaEl.setAttribute('content', 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no')
    docEl.firstElementChild.appendChild(metaEl)
  }

  window.dpr = dpr = window.devicePixelRatio || 1
  scale = 1 / dpr

  /**
   * 设置body字体大小
   */
  function setBodyFontSize () {
    if (document.body) {
      document.body.style.fontSize = (14 * dpr) + 'px'
    } else {
      document.addEventListener('DOMContentLoaded', setBodyFontSize)
    }
  }

  setBodyFontSize()

  /**
   * 设置一个rem = 屏幕宽度 / 10
   */
  function setRem () {
    const minSize = Math.min(docEl.clientWidth, docEl.clientHeight)
    rem = minSize * dpr / 10

    // 设置viewport，进行缩放，达到高清效果
    metaEl.setAttribute('content', 'width=' + minSize + ',initial-scale=' + scale + ',maximum-scale=' + scale + ', minimum-scale=' + scale + ',user-scalable=no')

    // 设置data-dpr属性，留作的css hack之用
    docEl.setAttribute('data-dpr', dpr)

    // 动态写入样式
    docEl.style.fontSize = rem + 'px'

    window.rem = rem
  }

  setRem()

  // 监听屏幕旋转或者尺寸变化
  window.addEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', setRem)

  // 给js调用的，某一dpr下rem和px之间的转换函数
  window.rem2px = function (v) {
    v = parseFloat(v)
    return v * rem
  }

  window.px2rem = function (v) {
    v = parseFloat(v)
    return v / rem
  }
})(window, document)
