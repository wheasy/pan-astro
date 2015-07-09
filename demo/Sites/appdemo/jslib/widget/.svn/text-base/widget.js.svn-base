/**
 * 选择器修改至Qwery，支持原生query和CSS2选择器
 * 支持格式如：
 *
 *   #foo{} .bar{} a#foo.bar{} #foo{} a[href]{} ul#list > li {} #foo a {}
 *   #foo a[title~=hello] {} #foo a[href^="http://"] {} #foo a[href$=com] {} #foo a[href*=twitter]
 *   span ~ strong {} p + p {}
 *   div,p{}
 *
 *   todo: ie6\7 存在查找disabled\readOnly 出错情况，待修复
 * @namespace M.Widget
 * @author jiangjibing
 * @date 2013/6/26
 */
Mo.define('widget', function(M) {
    var L = M.Lang;

    function widgetBase() {
        this._init.apply(this, arguments);
    }

    M.namespace('Widget');

    M.extend(widgetBase, M.Base);

    M.extend(widgetBase, {
        _init: function(config) {
            this.initDataByAttrs();
            this.setter(config);

            this.init.apply(this, arguments);
        }
    });
    /**
     * 定义组件
     * @param  {String} widgetName 组件名称
     * @param  {Obejct} cfg        组件方法
     * @return {Object}            返回定义好的组件
     */
    M.widget = function(widgetName, cfg) {
        var widget = function() {
            widget.superclass.constructor.apply(this, arguments);
        };
        widget.ATTRS = cfg.ATTRS || {};

        M.extend(widget, M.EventTarget);
        M.extend(widget, widgetBase, cfg);

        M.Widget[widgetName] = widget;
        return widget;
    };
    /**
     * 通过组件名称调用组件
     * @param  {String} widgetName 组件名
     * @param  {Object} cfg        组件参数
     * @return {Widget}            组件
     */
    M.getWidget = function(widgetName, cfg) {
        if (!M.Widget[widgetName]) {
            M.log('error', 'widget ' + widgetName + ' 不存在');
            return null;
        }
        return new M.Widget[widgetName](cfg||{});
    }
});