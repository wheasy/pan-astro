Mo.define('node-attrs', function(M) {
    var Lang = M.Lang,
    REGEX_SELECTED = /^(?:checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped)$/i,
    PROPFIX = (!document.documentElement.hasAttribute) ? {'for': 'htmlFor','class': 'className'}: {'htmlFor': 'for','className': 'class'},
    /**
     * 属性管理器
     */
    attributeManager = {
        /**
         * 获取节点属性
         * @param  {Object} el     基础节点
         * @param  {String} attr   属性名
         * @return {String}        对应属性的值
         */
        getAttr: function(el, attr) {
            var ret = undefined;
            try{
                if (el && attr && el.getAttribute) {
                    attr = PROPFIX[attr] || attr;
                    ret = el.getAttribute(attr);

                    if (ret === null) {
                        ret = undefined; // per DOM spec
                    }
                }
            }catch(eee){}
            return ret;
        },
        /**
         * 设置节点属性
         * @param {Object} el   基础节点
         * @param {String} attr 属性名
         * @param {String} val  属性值
         */
        setAttr: function(el, attr, val) {
            try{
                if (el && attr && el.setAttribute) {
                    attr = PROPFIX[attr] || attr;
                    el.setAttribute(attr, val);
                }
            }
            catch(eee){}
        },
        /**
         * 删除属性
         * @param  {Object} el    基础节点
         * @param  {String} attr  属性名
         */
        removeAttr: function(el, attr) {
            var name, propName, i = 0,
            attrNames = attr && attr.match(/\S+/g);
            if (attrNames && el.nodeType === 1) {
                M.each(function(name){
                    propName = PROPFIX[name] || name;
                    //如果是 checked,selected 等属性,则设置为false
                    if (REGEX_SELECTED(name)) {
                        el[propName] = false;
                    }
                    el.removeAttribute(name);
                });
            }

        }
    };

    M.attributeManager = attributeManager;
    /**
    * 节点属性相关操作
    */
    M.extend(M.Node,/** *@lends M.Node.prototype*/{
        /**
         * 返回指定属性名称
         * @param {String} attrName 属性名称
         * @return {String | null} 属性未定义时，返回null
         * ###HTML
         * ```
         * <div data-role="node" class="header" attr="data"></div>
         * ```
         * ###JS
         * M.role('node').getAttr('attr'); // data
         */
        getAttr: function(attr) {
            return attributeManager.getAttr(this._node, attr);
        },
        /**
         * 删除指定属性
         * @param {String} attr 属性名称
         * @return {Node} 返回节点本身
         * @example
         * ###HTML
         * ```
         * <div data-role="node" class="header" attr="data"></div>
         * ```
         * ###JS
         * M.role('node').removeAttr('attr');
         * 
         * ###result
         * ```
         * <div data-role="node" class="header"></div>
         * ```
         */
        removeAttr: function(attr) {
            var node = this._node;
            if (node) {
                node.removeAttribute(attr, 0); // comma zero for IE < 8 to force case-insensitive
            }
            return this;
        },
        /**
         * 设置节点属性值
         * @param {String} attr 属性名称
         * @param {String} value 属性值
         * @example
         * ###HTML
         * ```
         * <div data-role="node" class="header" attr="data"></div>
         * ```
         * ###JS
         * M.role('node').setAttr('attr','data0');
         * 
         * ###result
         * ```
         * <div data-role="node" class="header" attr="data0"></div>
         * ```
         *
         */
        setAttr: function(attr, value) {
            attributeManager.setAttr(this._node, attr, value);
            return this;
        },
        /**
         * 设置一组属性值
         * @param {Object} attrs 以属性名称为key的键值对
         *
         * @example
         * ###HTML
         * ```
         * <div data-role="node" class="header" attr="data" ></div>
         * ```
         * ###JS
         * M.role('node').setAttrs({'attr':'data0','attr1':'data1'});
         * 
         * ###result
         * ```
         * <div data-role="node" class="header" attr="data0" attr1="data1"></div>
         * ```
         */
        setAttrs: function(attrs) {
            var el = this._node;
            M.each(attrs, function(value, attr) {
                attributeManager.setAttr(el, attr, value);
            });
            return this;
        },
        /**
         * 判断节点属性是否存在
         * @param  {String}  attr 需要判断的元素
         * @return {Boolean}   是否存在
         * @example
         * ###HTML
         * ```
         * <div data-role="node" class="header" attr="data" ></div>
         * ```
         * ###JS
         * M.role('node').hasAttribute('attr'); //true
         */
        hasAttribute: function(attr) {
            var n = this._node;
            return n.hasAttribute ? this._node.hasAttribute(a) : !Lang.isUndefined(n[a]);
        },
    })
    
});