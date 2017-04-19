/**
 * 单选按钮&复选框
 * Created by Administrator on 2016-8-10.
 */
(function ($) {
    'use strict';

    var _checkedClass = 'z-checked',
        _uncheckedClass = 'z-unchecked',
        _disabledClass = 'z-disabled',
        _disabled = ':disabled',
        _checked = ':checked',
        _checkboxHandle = ':checkbox',
        _radioHandle = ':radio',
        _clickEvent = 'click';

    var getInputs = function (object) {

        var handle = _checkboxHandle + ',' + _radioHandle,
            $inputs = $();
        object.each(function () {
            var $item = $(this);

            if ($item.is(handle)) {
                $inputs = $inputs.add($item);
            } else {
                $inputs = $inputs.add($item.find(handle));
            }
        });

        return $inputs;
    };

    // 统一操作处理函数
    function operate(input, isClick, method) {

        if (!input.data('jCheck')) return;

        if (isClick) {

            if (!input.is(_checked)) {

                off(input, isClick);
            } else {

                on(input, isClick);
            }
        } else if (method == 'toggle') {

            toggle(input, isClick);
        } else if (method == 'check') {

            on(input, isClick);
        } else if (method == 'uncheck') {

            off(input, isClick);
        } else if (method == 'disable' || method == 'enable') {

            setState(input, method);
        } else if (method == 'update') {

            update(input)
        } else if (method == 'destroy') {

            destroy(input);
        }
    }

    // 切换
    function toggle(input, isClick) {

        if (input.is(_checked)) {

            off(input, isClick);
        } else {

            on(input, isClick);
        }
    }

    // 选中
    function on(input, isClick) {

        if (!input.is(_disabled)) {
            var $label = input.closest('label'),
                $parent = $label.size > 0 ? $label : input.parent(),
                opts = input.data('options') || {};

            $parent.addClass(opts.checkedClass || _checkedClass).removeClass(opts.uncheckedClass || _uncheckedClass);

            if (!isClick) input.prop('checked', true).trigger('change');

            if (input.is(_radioHandle) && input.attr('name')) {
                var $form = input.closest('form'),
                    inputs = ':radio[name="' + input.attr('name') + '"]',
                    $inputs = $form.size > 0 ? $form.find(inputs) : $(inputs);

                $inputs.each(function () {

                    if (!$(this).is(input)) {
                        off($(this), isClick);
                    }
                });
            }

            input.trigger('changed.jc', [$parent, input]);
        }
    }

    // 取消选中
    function off(input, isClick) {

        if (!input.is(_disabled)) {
            var $label = input.closest('label'),
                $parent = $label.size > 0 ? $label : input.parent(),
                opts = input.data('options') || {};

            $parent.addClass(opts.uncheckedClass || _uncheckedClass).removeClass(opts.checkedClass || _checkedClass);
            if (!isClick) input.prop('checked', false).trigger('change');

            input.trigger('changed.jc', [$parent, input]);
        }
    }

    // 设置状态
    function setState(input, state) {

        var $label = input.closest('label'),
            $parent = $label.size > 0 ? $label : input.parent(),
            opts = input.data('options') || {};

        if (state == 'disable') {

            $parent.addClass(opts.disabledClass || _disabledClass);
            input.prop('disabled', true);

            input.trigger('disabled.jc', [$parent, input]);
        } else {

            $parent.removeClass(opts.disabledClass || _disabledClass);
            input.prop('disabled', false);

            input.trigger('enabled.jc', [$parent, input]);
        }
    }

    // 销毁
    function destroy(input) {
        var $label = input.closest('label'),
            $parent = $label.size > 0 ? $label : input.parent(),
            opts = input.data('options') || {};

        input.off(_clickEvent).removeData('jCheck').removeData('options');

        input.trigger('destroy.jc', [$parent, input]);
    }

    // 更新
    function update(input) {

        var $label = input.closest('label'),
            $parent = $label.size > 0 ? $label : input.parent(),
            opts = input.data('options') || {};

        if (input.is(_checked)) {

            $parent.addClass(opts.checkedClass || _checkedClass).removeClass(opts.uncheckedClass || _uncheckedClass);
        } else {

            $parent.addClass(opts.uncheckedClass || _uncheckedClass).removeClass(opts.checkedClass || _checkedClass);
        }

        if (input.is(_disabled)) {

            $parent.addClass(opts.disabledClass || _disabledClass);
        } else {

            $parent.removeClass(opts.disabledClass || _disabledClass);
        }

        input.trigger('updated.jc', [$parent, input])
    }

    $.fn.extend({
        jCheck: function (settings, callback) {

            var $inputs = getInputs(this);

            if (typeof settings === 'string' && /^(check|uncheck|toggle|disable|enable|update|destroy)$/i.test(settings)) {

                settings = settings.toLowerCase(); //  忽略大小写

                $inputs.each(function () {
                    var $input = $(this);
                    operate($input, false, settings);
                });

                if ($.isFunction(callback)) callback(); // 回调

            } else if (typeof settings === 'object' || !settings) {

                var options = $.extend({
                    checkedClass: _checkedClass,
                    uncheckedClass: _uncheckedClass,
                    disabledClass: _disabledClass
                }, settings || {});

                $inputs.each(function () {

                    var $input = $(this);

                    $input.data({
                        jCheck: true,
                        options: options
                    }).on(_clickEvent, function () {

                        operate($(this), true);
                    });

                    operate($input, false, 'update');
                });
            } else {
                return this;
            }
        }
    });
})(jQuery);
