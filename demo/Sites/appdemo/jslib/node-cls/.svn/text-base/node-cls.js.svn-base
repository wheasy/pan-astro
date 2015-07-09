/**
 * 节点class相关操作
 */
Mo.define('node-cls', function(M) {
    var Lang = M.Lang,
    _regexCache = {},
    _getRegExp = function(str, flags){
        flags = flags || '';
        if (!_regexCache[str + flags]) {
            _regexCache[str + flags] = new RegExp(str, flags);
        }
        return _regexCache[str + flags];
    },
    /**
     * 判断节点是否存在class
     * @param  {Object}  node      基础节点
     * @param  {String}  className class名称
     * @return {Boolean}           是否存在
     */
    hasClass =  function(node, className) {
        var re = _getRegExp('(?:^|\\s+)' + className + '(?:\\s+|$)');
        return re.test(node.className);
    },
    /**
     * 删除节点class
     * @param  {Object}  node      基础节点
     * @param  {String}  className class名称
     */
    removeClass = function (node, className) {
        if(className.indexOf(',') > -1){
            className = className.split(',');
            M.each(className, function(cName) {
                removeClass(node, cName);
            });
        }
        if (className && hasClass(node, className)) {
            node.className = Lang.trim(node.className.replace(_getRegExp('(?:^|\\s+)' + className + '(?:\\s+|$)'), ' '));

            if ( hasClass(node, className) ) {//处理多个相同class的情况
                removeClass(node, className);
            }
        }
    },
    /**
     * 添加节点
     * @param {Object} node      基础节点
     * @param {String} className class名称
     */
    addClass = function(node, className) {
        if (!hasClass(node, className)) {
            node.className = Lang.trim([node.className, className].join(' '));
        }
    },
    classManager = {
        removeClass: removeClass,
        addClass: addClass,
        toggleClass: function(node, className, force) {
            var add = (force !== undefined) ? force : !(hasClass(node, className));

            if (add) {
                addClass(node, className);
            } else {
                removeClass(node, className);
            }
        },
        replaceClass: function(node, oldC, newC) {
            removeClass(node, oldC); // remove first in case oldC === newC
            addClass(node, newC);
        },
        hasClass:hasClass
    };
    M.classManager = classManager;
    /**
     * 节点class相关操作
     * @lends M.Node.prototype
     */
    var nodeCls = {
        /**
         * 判断当前节点是否拥有指定class
         * @param {string} className class名称
         * @return {boolean} 有用指定的classname则返回true
         * @example
         * ###HTML
         * ```
         * <div data-role="node" class="header"></div>
         * ```
         * ###JS
         * M.role('node').hasClass('header');// ture
         */
        hasClass: function(className) {
            return classManager.hasClass(this._node, className);
        },
        /**
         * 删除节点的class
         * @param  {String} className class名称
         * @return {Node}          返回当前node节点
         * @example
         * ###HTML
         * ```
         * <div data-role="node" class="header"></div>
         * ```
         * ###JS
         * M.role('node').removeClass('header');
         * 
         * ###result
         * ```
         * <div data-role="node"></div>
         * ```
         */
        removeClass: function(className) {
            classManager.removeClass(this._node, className);
            return this;
        },
        /**
         * 为节点添加class
         * @param {String} className class名称
         * @return {Node}          返回当前node节点
         * @example
         * ###HTML
         * ```
         * <div data-role="node" class="header"></div>
         * ```
         * ###JS
         * M.role('node').addClass('other');
         * 
         * ###result
         * ```
         * <div data-role="node" class="header other"></div>
         * ```
         * 
         */
        addClass: function(className) {
            classManager.addClass(this._node, className);
            return this;
        },
        /**
         * 点击时添加或者删除节点Class
         * @param {String} className class名称
         * @param {Boolean} b      当前是否是选中状态
         * @return {Node}          返回当前node节点
         * ###HTML
         * ```
         * <div data-role="node" class="header"></div>
         * ```
         * ###JS
         * M.role('node').toggleClass('other');
         * 
         * ###result
         * ```
         * <div data-role="node" class="header other"></div>
         * ```
         * ###JS
         * M.role('node').toggleClass('other');
         * ###result
         * ```
         * <div data-role="node" class="header"></div>
         * ```
         */
        toggleClass: function(className, b) {
            classManager.toggleClass(this._node, className, b);
            return this;
        },
        /**
         * 用指定的className替换某个className
         * @param {string} oldCls 要替换的className
         * @param {string} newCls 新的className
         * @example
         * ###HTML
         * ```
         * <div data-role="node" class="header"></div>
         * ```
         * ###JS
         * M.role('node').replaceClass('header','other');
         * 
         * ###result
         * ```
         * <div data-role="node" class="other"></div>
         * ```
         */
        replaceClass: function(oldCls, newCls) {
            classManager.replaceClass(this._node, oldCls, newCls);
            return this;
        }
        
    }
    M.extend(M.Node, nodeCls);
})