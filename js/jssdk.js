/**
 * 微信jssdk配置
 * Created by Administrator on 2016-5-27.
 */
(function (window, $) {
    'use strict';
    var _jsApiList = [
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'openLocation',
        'getLocation'
    ];

    var _weixinShareConfig = {
        title: '',
        desc: '',
        link: '',
        imgUrl: '',
        trigger: $.noop,
        success: $.noop,
        cancel: $.noop,
        fail: $.noop,
        complete: $.noop
    };

    var _openLocationConfig = {
        latitude: 0,
        longitude: 0,
        name: '',
        address: '',
        scale: 14,
        infoUrl: 'http://zanfitness.com/apkdown/zstu.html'
    };

    var getJsApiList = function () {
        return _jsApiList;
    };

    var _jssdk = function () {};

    _jssdk.prototype.weixinShare = function (config) {
        var options = $.extend(_weixinShareConfig, config || {});;

        wx.ready(function () {
            // 朋友圈
            wx.onMenuShareTimeline({
                title: options.desc, // 分享标题
                link: options.link, // 分享链接
                imgUrl: options.imgUrl, // 分享图标
                trigger: options.trigger,
                success: options.success,
                cancel: options.cancel,
                fail: options.fail,
                complete: options.complete
            });
            // 朋友
            wx.onMenuShareAppMessage({
                title: options.title, // 分享标题
                desc: options.desc, // 分享描述
                link: options.link, // 分享链接
                imgUrl: options.imgUrl, // 分享图标
                trigger: options.trigger,
                success: options.success,
                cancel: options.cancel,
                fail: options.fail,
                complete: options.complete
            });
        });
    };

    _jssdk.prototype.weixinOpenLocation = function (config) {
        var options = $.extend(_openLocationConfig, config || {});
        wx.openLocation({
            latitude: options.latitude,
            longitude: options.longitude,
            name: options.name,
            address: options.address,
            scale: options.scale,
            infoUrl: options.infoUrl
        });
    };

    _jssdk.prototype.weixinConfig = function (appId, timestamp, nonceStr, signature) {
        var jsApiList = getJsApiList();
        wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: appId, // 必填，公众号的唯一标识
            timestamp: timestamp, // 必填，生成签名的时间戳
            nonceStr: nonceStr, // 必填，生成签名的随机串
            signature: signature,// 必填，签名，见附录1
            jsApiList: jsApiList // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
    };

    _jssdk.prototype.init = function () {
        // 请求签名
        var _this = this;
        var data = {
            url: location.href.split('#')[0]
        };
        $.ajaxRestful({
            url: app.API_URL + '/v2/wechat/wechatSign',
            data: JSON.stringify(data),
            success: function (res){
                console.log('请求微信签名接口成功：', res);
                if(res.code == '0') {
                    _this.weixinConfig(res.body.appId, res.body.timestamp, res.body.nonceStr, res.body.signature);
                } else {
                    common.tips(res.desc);
                }
            }
        });
    };

    var jssdk = window.jssdk = new _jssdk();
    jssdk.init();
})(window, jQuery);