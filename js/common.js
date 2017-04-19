/**
 * 公共js
 */
(function (window, document, $) {
    'use strict';

    /* Date对象扩展函数 */
    if (!Date.prototype.format) {
        /**
         * 日期格式化
         * @param fmt
         * @returns {*}
         */
        Date.prototype.format = function (fmt) {
            var o = {
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "h+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        }
    }

    var common = {};
    var resizeEventName = common.resizeEventName = 'onorientationchange' in window ? 'orientationchange' : 'resize';

    common.global = {
        ratio: 1,
        baseWidth: 640, // 基础宽度（1倍）
        baseHeight: 1008, // 基础高度
        baseFontSize: 100, // 基础字体大小，640px下100px
        designWidth: 640, // 设计图宽度
        designHeight: 1008, // 设计图一屏高度
        isSinglePanel: false
    };

    /* Location扩展对象 */
    common.location = {
        /**
         * 获取指定值的param
         * @param key
         * @returns {string}
         */
        getParam: function (key) {
            var search = location.search.substr(1);
            //console.log('location search: ', typeof search, search);

            var params = search.split('&');
            //console.log('location params: ', typeof params, params);

            var value = '';
            for (var i = 0; i < params.length; i++) {
                if (!!params[i]) {
                    var param = params[i].split('=');
                    if (key == param[0]) {
                        value = param[1];
                        break;
                    }
                }
            }

            return value;
        }
    };

    /* Storage扩展对象 */
    common.storage = {
        /**
         * 在本地Session储存中添加值
         * @param key
         * @param value
         * @returns {*}
         */
        addSession: function (key, value) {
            sessionStorage.setItem(key, value);
            return value;
        },
        /**
         * 在本地Session储存中获取值
         * @param key
         * @returns {string}
         */
        getSession: function (key) {
            return sessionStorage.getItem(key) || '';
        },
        /**
         * 在本地Session储存中移除值
         * @param key
         * @returns {*}
         */
        removeSession: function (key) {
            sessionStorage.removeItem(key);
            return key;
        },
        /**
         * 在本地Local储存中添加值
         * @param key
         * @param value
         * @returns {*}
         */
        addLocal: function (key, value) {
            localStorage.setItem(key, value);
            return value;
        },
        /**
         * 在本地Local储存中获取值
         * @param key
         * @returns {string}
         */
        getLocal: function (key) {
            return localStorage.getItem(key) || '';
        },
        /**
         * 在本地Local储存中移除值
         * @param key
         * @returns {*}
         */
        removeLocal: function (key) {
            localStorage.removeItem(key);
            return key;
        }
    };


    // 获取浏览器信息
    common.getBrowser = function () {
        return {
            versions: function () {
                var u = navigator.userAgent, app = navigator.appVersion;
                return {//移动终端浏览器版本信息
                    trident: u.indexOf('Trident') > -1, //IE内核
                    presto: u.indexOf('Presto') > -1, //opera内核
                    webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                    gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                    mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
                    ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                    android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
                    iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
                    iPad: u.indexOf('iPad') > -1, //是否iPad
                    weChat: u.indexOf('MicroMessenger') > -1, //是否微信
                    webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
                };
            }(),
            language: (navigator.browserLanguage || navigator.language).toLowerCase() // 语言版本
        }
    };

    // 判断横竖屏
    common.getOrientation = function () {
        var orientation = 'portrait';
        if (window.orientation) {
            var winOrientation = window.orientation;
            if (winOrientation == 0 || winOrientation == 180) {
                // 竖屏
                orientation = 'portrait';
            } else if (winOrientation == 90 || winOrientation == -90) {
                // 横屏
                orientation = 'landscape';
            }
        }
        return orientation;
    };

    // 获取缩放尺寸
    common.getAutoSize = function (designWidth, designHeight, screenWidth, screenHeight, isFix, isSinglePanel) {
        screenWidth = screenWidth || document.documentElement.clientWidth;
        screenHeight = screenHeight || document.documentElement.clientHeight;
        var _widthRatio, _heightRatio, _ratio = 1;
        console.log('浏览器宽度', screenWidth);
        console.log('浏览器高度', screenHeight);

        _widthRatio = screenWidth / designWidth;
        _heightRatio = screenHeight / designHeight;
        if (screenWidth == 0) {

            if (isFix || _heightRatio < 1)
                _ratio = _heightRatio;
        } else if (screenHeight == 0) {

            if (isFix || _widthRatio < 1)
                _ratio = _widthRatio;
        } else {

            if (isSinglePanel && (isFix || (_widthRatio < 1 && _heightRatio < 1))) {
                _ratio = _widthRatio <= _heightRatio ? _widthRatio : _heightRatio;
            }

            if(!isSinglePanel && (isFix || _widthRatio < 1)) {
                _ratio = _widthRatio;
            }
        }

        return {
            width: designWidth * _ratio,
            height: designHeight * _ratio,
            ratio: _ratio
        };
    };

    common.setFontSize = function () {
        var designWidth = common.global.designWidth;
        var designHeight = common.global.designHeight;

        // 是否单屏显示页面内容
        var attrSinglePanel = document.documentElement.attributes['single-panel'];
        var isSinglePanel = (!!attrSinglePanel && attrSinglePanel.value != 'false') || common.global.isSinglePanel;
        if (common.getOrientation() == 'landscape') {
            // 横屏不能单屏显示页面内容
            isSinglePanel = false;
        }
        var ratio = common.global.ratio = common.getAutoSize(designWidth, designHeight, null, null, false, isSinglePanel).ratio;

        document.documentElement.style.fontSize = common.global.baseFontSize * ratio + 'px';
    };

    // 打开app，type 1=>课程 2=>小组 3=> 活动
    common.openApp = function (type, id) {
        var browser = this.getBrowser();

        var data;
        data = {
            webType: type,
            webValue: id
        };

        var config = {
            /*scheme:必须*/
            schemeForIOS: 'zanfitness://' + JSON.stringify(data),
            schemeForAndroid: 'zanfitness://www.zanfitness.com:8080?' + JSON.stringify(data),
            downloadUrl: 'http://zanfitness.com/apkdown/zstu.html',
            weChatDownloadUrl: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.zanfitness.student',
            timeout: 600
        };

        // 判断是否是移动终端
        if (browser.versions.mobile) {
            if (browser.versions.weChat) {
                // 直接跳转至应用宝
                window.location.href = config.weChatDownloadUrl;
            } else {
                location.href = browser.versions.ios ? config.schemeForIOS : config.schemeForAndroid;
                setTimeout(function () {
                    layer.confirm('是否现在去下载应用？', {
                        title: '信息',
                        btn: [
                            '确定',
                            '取消'
                        ]
                    }, function(e){
                        location.href =config.downloadUrl;
                    });
                }, config.timeout);
            }
        }
    };

    common.tips = function (msg, cb) {
        cb = cb && cb instanceof Function ? cb : function (e) {};
        return layer.msg(msg, {time: 2000}, cb);
    };

    common.loading = function (msg, cb) {
        msg = msg && typeof msg  ? msg : '正在加载中...'
        cb = cb && cb instanceof Function ? cb : function (e) {};
        return layer.msg(msg, { time: 0, shade: [1, 'rgba(0, 0, 0, 0)'] }, cb);
    };

    common.unloading = function (index) {
        layer.close(index);
    };

    window.common = common;

    // 初始化页面字体大小
    common.setFontSize();
    if (window.addEventListener) {
        window.addEventListener(common.resizeEventName, common.setFontSize);
    }
})(window, document, jQuery);