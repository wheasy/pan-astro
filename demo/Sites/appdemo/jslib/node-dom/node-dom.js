 /**
 * 节点插入相关操作
 * @namespace M
 * @lends M.Node.prototype
 */
Mo.define('node-dom', function(M) {
    var Lang = M.Lang,
        M_DOM = M.DOM,
        STR_PREFIX = M.config.prefix,
        _wrapFn = function(fn) {
            var ret = null;
            if (fn) {
                if (typeof fn == 'string') {
                    ret = function(n) {
                        return M.Selector.test(n, fn);
                    };
                } else {
                    ret = function(n) {
                        return fn(M.one(n));
                    };
                }
            }

            return ret;
        };
    /**
     * @lends M.Node.prototype
     */
    var dom = {
        /**
         * 清空几点子元素
         * @return {Node} 当前节点
         */
        empty: function() {
            var self = this;
            var cs = self.get('childNodes');
            cs.length != 0 && cs.remove(); //.destroy(true);
            return self;
        },
        /**
         * 向节点中插入html 
         * @param {String} content 插入内容
         * @param {Node | String} where   插入位置replace| before | after 默认append 
         */
        addHTML: function(content, where) {
            var node = this._node,
                nodeParent = node.parentNode,
                i = 0,
                item, ret = content,
                newNode;
            if (content != undefined) { // not null or undefined (maybe 0)
                if (content.nodeType) { // DOM node, just add it
                    newNode = content;
                } else if (typeof content == 'string' || typeof content == 'number') {
                    ret = newNode = M.Node.create(content, null, true);
                } else if (content[0] && content[0].nodeType) { // array or collection
                    newNode = M.config.doc.createDocumentFragment();
                    while ((item = content[i++])) {
                        newNode.appendChild(item); // append to fragment for insertion
                    }
                }
            }

            if (where) {
                if (newNode && where.parentNode) { // insert regardless of relationship to node
                    where.parentNode.insertBefore(newNode, where);
                } else {
                    switch (where) {
                        case 'replace':
                            while (node.firstChild) {
                                node.removeChild(node.firstChild);
                            }
                            if (newNode) { // allow empty content to clear node
                                node.appendChild(newNode);
                            }
                            break;
                        case 'before':
                            if (newNode) {
                                nodeParent.insertBefore(newNode, node);
                            }
                            break;
                        case 'after':
                            if (newNode) {
                                if (node.nextSibling) { // IE errors if refNode is null
                                    nodeParent.insertBefore(newNode, node.nextSibling);
                                } else {
                                    nodeParent.appendChild(newNode);
                                }
                            }
                            break;
                        default:
                            if (newNode) {
                                node.appendChild(newNode);
                            }
                            break;
                    }
                }
            } else if (newNode) {
                node.appendChild(newNode);
            }

            return ret;
        },
        /**
         * 在节点指定位置插入节点
         * @method insert
         * @static
         * @param {string} content 要创建的节点代码
         * @param {HTMLElement | Array | HTMLCollection} [where] 指定插入位置
         * 如果未指定where参数，则插入到当前节点结尾
         * <dl>
         * <dt>HTMLElement</dt>
         * <dd>插入到指定节点之前</dd>
         * <dt>"replace"</dt>
         * <dd>替换当前的节点</dd>
         * <dt>"before"</dt>
         * <dd>插入到当前节点前</dd>
         * <dt>"after"</dt>
         * <dd>插入到当前节点之后</dd>
         * </dl>
         * @return {Node} DOM原生节点或文档碎片fragment
         */
        insert: function(content, where) {
            this._insert(content, where);
            return this;
        },
        _insert: function(content, where) {
            var node = this._node,
                ret = null;

            if (typeof where == 'number') { // allow index
                where = this._node.childNodes[where];
            } else if (where && where._node) { // Node
                where = where._node;
            }

            if (content && typeof content != 'string') { // allow Node or NodeList/Array instances
                content = content._node || content._nodes || content;
            }
            //if(content){  ccontent是0或空字符串时,无法设置内容
            ret = this.addHTML(content, where);
            //}

            return ret;
        },
        /**
         * 把当前元素添加到指定节点
         * @method insert
         * @param {string | HTMLElement} node 要创建的节点代码
         * @param {HTMLElement | Array | HTMLCollection} [where] 指定插入位置
         */
        appendTo: function(node) {
            M.one(node).append(this);
            return this;
        },
        /**
         * 把指定内容插入到当前节点firstChild的位置
         * @method insert
         * @param {String | Node | HTMLElement} content 要插入的内容
         * @param {Node} 当前节点
         */
        prepend: function(content) {
            return this.insert(content, 0);
        },
        /**
         * 把当前元素添加到指定节点
         * @method insert
         * @param {String | Node | HTMLElement} content 要插入的内容
         * @param {Node} 当前节点
         */
        append: function(content) {
            return this.insert(content, null);
        },
        /**
         * @method appendChild
         * @param {String | Node | HTMLElement} content 要插入的节点
         * @param {Node} 被添加的节点
         */
        appendChild: function(node) {
            return M.Node.scrubVal(this._insert(node));
        },
        /**
         * 在指定节点之前插入元素
         * @method insertBefore
         * @param {String | Node | HTMLElement} newNode 要添加的新元素
         * @param {Node} 被添加的节点
         */
        insertBefore: function(node) {
            return M.Node.scrubVal(this._insert(node, 'before'));
        },
        /**
         * 在指定节点之后插入元素
         * @param  {String | Node | HTMLElement} node 要添加的新元素
         * @return {Node}      当前节点
         */
        insertAfter: function(node) {
            return M.Node.scrubVal(this._insert(node, 'after'));
        },
        /**
         * 执行一个函数,为了实现任意节点或节点列表的each兼容
         * @param  {Function} fn    需要执行的函数
         * @param  {Object}   content 函数执行环境
         * @return {Anything}          函数运行结果
         */
        each: function(fn, content) {
            return fn.call(content || this, this, 0);
        },
        /**
         * 删除当前节点
         * @method remove
         * @param {String | Node | HTMLElement} destroy 要添加的新元素
         * @param {String | Node | HTMLElement} refNode 新元素将插入到该节点之前
         * @param {Node} 被添加的节点
         */
        remove: function(destroy) {
            var node = this._node;

            if (node && node.parentNode) {
                node.parentNode.removeChild(node);
            }

            if (destroy) {
                this.destroy(true);
            }

            return this;
        },
        /**
         * 替换当前节点
         * @param  {String | Node | HTMLElement} newNode 替换的内容
         * @return {Node}         当前节点
         */
        replace: function(newNode) {
            var node = this._node;
            if (typeof newNode == 'string') {
                newNode = M_Node.create(newNode, null, true);
            } else {
                newNode = newNode.getDOMNode ? newNode.getDOMNode() : newNode;
            }
            node.parentNode.replaceChild(newNode, node);
            return this;
        },
        /**
         * 销毁当前节点，解绑绑定事件，清空data，解绑插件
         * @method destroy
         */
        destroy: function(recursive) {
            //TODO
            //var UID = M.config.doc.uniqueID ? 'uniqueID': '_yuid',
            var instance,
                self = this;

            //this.purge(); // TODO: only remove events add via this Node
            if (self.unplug) { // may not be a PluginHost
                self.unplug();
            }

            self.clearData();
            if (recursive) {
                M.NodeList.each(self.all('*'), function(node) {
                    instance = M_Node._instances[node[STR_PREFIX]];
                    if (instance) {
                        instance.destroy();
                    } else { // purge in case added by other means
                        //M.Event.purgeElement(node);
                    }
                });
            }

            self._node = null;
            self._stateProxy = null;

            delete M_Node._instances[self[STR_PREFIX]];
        },
        /**
         * 设置节点内HTML，会替换原有的HTML；
         * @param {HTML|node} content 插入的内容
         */
        setHTML: function(content) {
            this._insert(content, 'replace');
            return this;
        },
        /**
         * 获取节点内html;
         * @return {HTML} 节点内原生节点
         */
        getHTML: function() {
            return this.get('innerHTML');
        },
        /**
         * 设置元素内文本
         * @param {String} text 文本内容
         */
        setText: function(text) {
            M_DOM.setText(this._node, text);
            return this;
        },
        /**
         * 获取元素内文本
         * @return {String} text 文本内容
         */
        getText: function() {
            return M_DOM.getText(this._node);
        },
        /**
         * 获取data-attrs属性内的data并解析成对象，aa=bb&cc=dd&结构
         * @param  {type} k [description]
         * @return {type}   [description]
         */
        getDataValue: function(k) {
            var d = Lang.getDataValue(this.getAttr('data-attrs'));
            return k ? (d[k] || '') : d;
        },
        /**
         * ??
         * @param  {type} selector [description]
         * @return {type}          [description]
         */
        test: function(selector) {
            return M.Selector.test(this._node, selector);
        },

        /**
         * 测试一个节点是否在另一个节点内
         * @param  {type} needle [description]
         * @return {type}        [description]
         */
        contains: function(needle) {
            if (needle._node) {
                needle = needle._node;
            }
            return M_DOM.contains(this._node, needle);
        },
        /**
         * 获取节点的父节点
         * @param  {Function} [fn]       父节点需要满足的函数必须返回true和false
         * @param  {Boolean}   [testSelf] 是否用fn检测当前节点
         * @param  {Function}   [stopFn]   是否需要停止查找函数必须返回true和false
         * @return {HTMLElement | null}            返回父节点
         */
        ancestor: function(fn, testSelf, stopFn) {
            // testSelf is optional, check for stopFn as 2nd arg
            if (arguments.length === 2 && (typeof testSelf == 'string' || typeof testSelf == 'function')) {
                stopFn = testSelf;
            }

            return M.one(M_DOM.ancestor(this._node, _wrapFn(fn), testSelf, _wrapFn(stopFn)));
        },
        /**
         * 返回父节点数组
         * @param  {Function} [fn]       父节点需要满足的函数必须返回true和false
         * @param  {Boolean}   [testSelf] 是否用fn检测当前节点
         * @param  {Function}   [stopFn]   是否需要停止查找函数必须返回true和false
         * @return {Array}            返回父节点数组
         */
        ancestors: function(fn, testSelf, stopFn) {
            return M.all(M_DOM.ancestors(this._node, _wrapFn(fn), testSelf, _wrapFn(stopFn)));
        },
        /**
         * 获取当前节点的下一个节点
         * @param  {Function} [fn]  节点需要满足的函数必须返回true和false
         * @param  {String}   [all] 不区分tagname
         * @return {Node}     查找出的节点
         */
        next: function(fn, all) {
            return M.one(M_DOM.elementByAxis(this._node, 'nextSibling', _wrapFn(fn), all));
        },
        /**
         * 获取当前节点的上一个节点
         * @param  {Function} [fn]  节点需要满足的函数必须返回true和false
         * @param  {String}   [all] 不区分tagname
         * @return {Node}     查找出的节点
         */
        previous: function(fn, all) {
            return M.one(M_DOM.elementByAxis(this._node, 'previousSibling', _wrapFn(fn), all));
        },
        /**
         * 获取当前节点的全部兄弟节点
         * @param  {Function} [fn]  节点需要满足的函数必须返回true和false
         * @return {Node}     查找出的节点数组
         */
        siblings: function(fn) {
            return M.all(M_DOM.siblings(this._node, _wrapFn(fn)));
        }
    };
    
    M.extend(M.Node, dom);
})