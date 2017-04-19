/**
 * 简单的跑马灯效果
 * Created by Administrator on 2016-11-25.
 */
'use strict';
(function ($) {

    $.fn.jMarquee = function (settings) {
        var options = $.extend(true, {
            speed: 50, // 速率，单位px/s
            wrapperSelector: '.jm-wrapper',
            marqueeAnimationClass: 'jm-a-marquee',
            onStared: $.noop,
            onPaused: $.noop
        }, settings || {});
        var $marqueeContainer = $(this);
        var $marqueeWrapper = $marqueeContainer.find(options.wrapperSelector);
        var containerWidth = $marqueeContainer.outerWidth();

        /*---- functions ----*/
        var starAnimation = function () {
            $marqueeWrapper.css({
                '-webkit-animation-play-state': 'running',
                'animation-play-state': 'running'
            });
            options.onStared($marqueeContainer);
        };
        
        var stopAnimation = function () {
            $marqueeWrapper.css({
                '-webkit-animation-play-state': 'paused',
                'animation-play-state': 'paused'
            });
            options.onPaused($marqueeContainer);
        };

        // 设置动画duration，单位ms
        var setDuration = function (duration) {
            $marqueeWrapper.css({
                '-webkit-animation-duration': duration + 'ms',
                'animation-duration': duration + 'ms'
            })
        };
        
        // 初始化
        var init = function () {

            $marqueeWrapper.css({
                '-webkit-transform': 'translateX(' + containerWidth + 'px)',
                'transform': 'translateX(' + containerWidth + 'px)'
            });

            $marqueeWrapper.addClass(options.marqueeAnimationClass);

            var duration = parseInt(containerWidth / parseInt(options.speed) * 1000); // 单位 ms
            setDuration(duration);
            starAnimation();
        };

        init();

        return $marqueeContainer;
    };

})(jQuery);