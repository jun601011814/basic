/**
 * ie9以下模拟placeholder
 * @type {{_check: Function, init: Function, fix: Function}}
 * Created by Administrator on 2016-1-14.
 */
(function ($) {
    'use strict';
    var JPlaceHolder = {
        //检测
        _check: function () {
            return 'placeholder' in document.createElement('input');
        },

        //初始化
        init: function () {
            if (!this._check()) {
                this.fix();
            }
        },

        //修复
        fix: function () {
            $(':input[placeholder]').each(function (index, element) {
                var self = $(this),
                    txt = self.attr('placeholder');
                self.wrap($('<div></div>').css({
                    position: 'relative',
                    zoom: '1',
                    border: 'none',
                    background: 'none',
                    padding: 'none',
                    margin: 'none'
                }));

                var pos = self.position(),
                    height = self.outerHeight(),
                    paddingLeft = self.css('padding-left'),
                    fontSize = self.css("font-size");
                var holder = $('<span></span>').text(txt).css({
                    display: "block",
                    position: 'absolute',
                    left: pos.left,
                    top: pos.top,
                    height: height,
                    lineHeight: height + "px",
                    paddingLeft: paddingLeft,
                    fontSize: fontSize,
                    color: '#fff'
                }).appendTo(self.parent());

                self.focusin(function (e) {
                    holder.hide();
                }).focusout(function (e) {
                    if (!self.val()) {
                        holder.show();
                    }
                });
                holder.click(function (e) {
                    holder.hide();
                    self.focus();
                });
            });
        }
    };

    $(function () {
        JPlaceHolder.init();
    });
})(jQuery);

