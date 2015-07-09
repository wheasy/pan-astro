/**
 * @namespace M
 * 
 */
Mo.define('node-core', function(M) {
	var STR_PREFIX = M.config.prefix,
        _fragClones = {},
		M_DOM = M.DOM,
        Lang = M.Lang,
        STR_NODE_TYPE = 'nodeType',
        STR_TAG_NAME = 'tagName',
		re_aria = /^(?:role$|aria-)/,
        _create = function(html, doc, tag) {
            tag = tag || 'div';

            var frag = _fragClones[tag];
            if (frag) {
                frag = frag.cloneNode(false);
            } else {
                frag = _fragClones[tag] = doc.createElement(tag);
            }
            frag.innerHTML = html;
            return frag;
        },
        creators = {},
        createFromDIV = function(html, tag) {
            var div = M.config.doc.createElement('div'),
                ret = true;

            div.innerHTML = html;
            if (!div.firstChild || div.firstChild.tagName !== tag.toUpperCase()) {
                ret = false;
            }

            return ret;
        },
        _nl2frag = function(nodes, doc) {
            var ret = null,
                i, len;

            if (nodes && (nodes.push || nodes.item) && nodes[0]) {
                doc = doc || nodes[0].ownerDocument;
                ret = doc.createDocumentFragment();

                if (nodes.item) {
                    // convert live list to static array
                    //TODO
                    nodes = M.Array.toArray(nodes, 0, true);
                }

                for (i = 0, len = nodes.length; i < len; i++) {
                    ret.appendChild(nodes[i]);
                }
            } // else inline with log for minification
            return ret;
        };
    //creators
    if (!(function() {
            var node = M.config.doc.createElement('table');
            try {
                node.innerHTML = '<tbody></tbody>';
            } catch (e) {
                return false;
            }
            return (node.firstChild && node.firstChild.nodeName === 'TBODY');
        }())) {
        creators.tbody = function(html, doc) {
            var frag = Y_DOM.create(TABLE_OPEN + html + TABLE_CLOSE, doc),
                tb = Y.DOM._children(frag, 'tbody')[0];

            if (frag.children.length > 1 && tb && !re_tbody.test(html)) {
                tb.parentNode.removeChild(tb); // strip extraneous tbody
            }
            return frag;
        };
    }
    if (!createFromDIV('<script type="text/javascript">< script > </script>/</script>', 'script')) {
        creators.script = function(html, doc) {
            var frag = doc.createElement('div');

            frag.innerHTML = '-' + html;
            frag.removeChild(frag.firstChild);
            return frag;
        };
        creators.link = creators.style = creators.script;
    }
    if (!createFromDIV('<tr></tr>', 'tr')) {
        M.mix(creators, {
            option: function(html, doc) {
                return M_Node.create('<select><option class="moui-big-dummy" selected></option>' + html + '</select>', doc, 1);
            },

            tr: function(html, doc) {
                return M_Node.create('<tbody>' + html + '</tbody>', doc, 1);
            },

            td: function(html, doc) {
                return _create('<tr>' + html + '</tr>', doc, 1);
            },

            col: function(html, doc) {
                return M_Node.create('<colgroup>' + html + '</colgroup>', doc, 1);
            },
            tbody: 'table'
        });
        M.mix(creators, {
            legend: 'fieldset',
            th: creators.td,
            thead: creators.tbody,
            tfoot: creators.tbody,
            caption: creators.tbody,
            colgroup: creators.tbody,
            optgroup: creators.option
        });
    }

    /**
     * Node类封装了一些操作节点的通用方法。可通过get/set方法访问,修改Node的属性。可通过M.one方法获得Node实例
     * @class M.Node
     * @example
     * M.one(selector); //可以通过css选择器获取到node对象
     * M.role(roleName);//可以通过data-role=roleName获取到node对象
     * M.all(selector);//可以通过css选择器获取到nodelist对象
     */

    var M_Node = function(node) {
        if (!node) {
            M.log(arguments.callee.caller)
            return null; // NOTE: return
        }

        if (typeof node == 'string') {
            node = M_Node._fromString(node);
            if (!node) {
                return null; // NOTE: return
            }
        }

        var uid = node[STR_PREFIX];

        if (uid && M_Node._instances[uid] && M_Node._instances[uid]._node !== node) {
            node[uid] = null; // unset existing uid to prevent collision (via clone or hack)
        }

        uid = uid || M.stamp(node);

        this[STR_PREFIX] = uid;

        this._node = node;

        //this.setAttr(STR_PREFIX, uid);
        
        this._stateProxy = node;
    };
    M.Node = M_Node;
	var staticMethods = {
        /**
         * 提供节点操作属性操作的方法。如不同节点类型value的set和get
         * @prorotype {obejct} attrFix
         */
        attrFix: {},
        DEFAULT_GETTER: function(name) {
            var node = this._stateProxy,
                val;

            if (name.indexOf && name.indexOf('.') > -1) {
                val = Lang.getObjValue(node, name.split('.'));
            } else if (typeof node[name] != 'undefined') { // pass thru from DOM
                val = node[name];
            }

            return val;
        },
        DEFAULT_SETTER: function(name, val) {
            var node = this._stateProxy,
                strPath;

            if (name.indexOf('.') > -1) {
                strPath = name;
                name = name.split('.');
                // only allow when defined on node
                Lang.setObjValue(node, name, val);
            } else if (typeof node[name] != 'undefined') { // pass thru DOM properties
                node[name] = val;
            }

            return val;
        },
        /**
         * 把原型节点和节点列表封装成M.Node或M.NodeList，如果参数是无效对象，则返回null。
         * @method {Any} node M.Node实例或HTMLNode
         * @return {Node | Node.List | null} 取决于传入的值
         */
        scrubVal: function(val, node) {
            if (val) {
                if (typeof val == 'object' || typeof val == 'function') { // safari nodeList === function
                    if (STR_NODE_TYPE in val || M_Node.isWindow(val)) { // node || window
                        val = M.one(val);
                    } else if ((val.item && !val._nodes) || // dom collection or Node instance
                        (val[0] && val[0][STR_NODE_TYPE])) { // array of DOM Nodes
                        val = M.all(val);
                    }
                }
            } else if (typeof val === 'undefined') {
                val = node; 
            } else if (val === null) {
                val = null; 
            }
            return val;
        },
        _fromString: function(node, root) {
            if (node) {
                if (node.indexOf('doc') === 0) { // doc OR document
                    node = M.config.doc;
                } else if (node.indexOf('win') === 0) { // win OR window
                    node = M.config.win;
                } else {
                    node = M.Selector.query(node, root)[0];
                }
            }

            return node || null;
        },
        _instances: {},
        /**
         * 判断一个对象是否是window对象
         * @static
         * @param {object} obj
         * @return {Boolean}
         */
        isWindow: function(obj) {
            return !!(obj && obj.scrollTo && obj.document);
        },
        /**
         * 根据传入的标签，创建一个新节点 不支持创建空tr接待你
         * @static
         * @param {string} html 要创建的节点代码
         * @param {HTMlElement}  document对象，默认为当前窗口的document对象
         * @return {Node} DOM原生节点或文档碎片fragment
         */
        create: function(html, doc, isDom) {
            //from yui
            var re_tag = /<([a-z]+)/i;

            if (typeof html === 'string') {
                html = Lang.trim(html); // match IE which trims whitespace from innerHTML
            }
            doc = doc || document;
            var m = re_tag.exec(html),
                create = _create,
                custom = creators,
                ret = null,
                creator,
                tag,
                nodes;



            if (html != undefined) { // not undefined or null
                if (m && m[1]) {
                    creator = custom[m[1].toLowerCase()];

                    if (typeof creator === 'function') {
                        create = creator;
                    } else {
                        tag = creator;
                    }
                }
                nodes = create(html, doc, tag).childNodes;
                //console.log(nodes.length)
                if (nodes.length === 1) { // return single node, breaking parentNode ref from "fragment"
                    ret = nodes[0].parentNode.removeChild(nodes[0]);
                } else if (nodes[0] && nodes[0].className === 'moui-big-dummy') { // using dummy node to preserve some attributes (e.g. OPTION not selected)
                    /*} else if (nodes[0]) { // using dummy node to preserve some attributes (e.g. OPTION not selected)*/
                    if (nodes.length === 2) {
                        ret = nodes[0].nextSibling;
                    } else {
                        nodes[0].parentNode.removeChild(nodes[0]);
                        ret = _nl2frag(nodes, doc);
                    }
                } else { // return multiple nodes as a fragment
                    ret = _nl2frag(nodes, doc);
                }
            }
            return isDom ? ret : M.one(ret);
        },
        /**
         *获取图片原始尺寸
         */
        getImgSize: function(img) {
            if (!Lang.isObject(img)) {
                return null;
            }
            var img = img._node || img,
                org = new Image(),
                wh = {};

            org.src = img.src;

            wh = {
                width: org.width,
                height: org.height
            };
            org = null;
            return wh;
        }
    };

    M.each(staticMethods, function(fun, name) {
        M.Node[name] = fun;
    });
    M.extend(M_Node.attrFix, {
        'children': {
            getter: function() {
                var node = this._node,
                    children = node.children,
                    childNodes, i, len;

                if (!children) {
                    childNodes = node.childNodes;
                    children = [];

                    for (i = 0, len = childNodes.length; i < len; ++i) {
                        if (childNodes[i].tagName) {
                            children[children.length] = childNodes[i];
                        }
                    }
                }
                return M.all(children);
            }
        },
        selectedItem: {
            getter: function() {
                var node = this._node,
                    val = node.value,
                    options = node.options;

                if (options && options.length) {
                    // TODO: implement multipe select
                    if (node.multiple) {} else if (node.selectedIndex > -1) {
                        return M.one(options[node.selectedIndex]);
                    }
                }
                return null;
            }
        },
        value: {
            getter: function() {
                return M_DOM.getValue(this._node);
            },

            setter: function(val) {
                M_DOM.setValue(this._node, val);
                return val;
            }
        }
        
    });
    /** @lends M.Node.prototype*/
    var nodeCls = {
        /**
         * 用字符串形式调用节点原生方法，用于原生节点操作
         * @param  {String} method 方法名
         * @param  {String | Node} [a]      方法第一个参数 可为节点
         * @param  {String | Node} [b]      方法第二个参数 可为节点
         * @param  {Anything} [c]      方法第三个参数
         * @param  {Anything} [d]      方法第四个参数
         * @param  {Anything} [e]      方法第五个参数
         * @return {Node}        当前节点
         *
         * @example
         * ###HTML
         * ```
         * <div data-role="data"></div>
         * ```
         *
         * ###JS
         * M.one('data').invoke('innerHTML'); // 输出标签内容
         */
        invoke: function(method, a, b, c, d, e) {
            var node = this._node,
                ret;

            if (a && a._node) {
                a = a._node;
            }

            if (b && b._node) {
                b = b._node;
            }

            ret = node[method](a, b, c, d, e);
            return M_Node.scrubVal(ret, this);
        },
        /**
         * 获取原生节点属性
         * @param  {String} attr 原生节点属性名
         * @return {String | Object}      对应值
         */
        get: function(attr) {
            var attrConfig = M_Node.attrFix[attr],
                val;

            if (attrConfig && attrConfig.getter) {
                val = attrConfig.getter.call(this);
            } else if (re_aria.test(attr)) {
                val = this._node.getAttribute(attr, 2);
            } else {
                val = M_Node.DEFAULT_GETTER.apply(this, arguments);
            }

            if (val) {
                if (val.length && val.length > 0 && val[0][STR_NODE_TYPE] && val[0][STR_NODE_TYPE] !== 2) {

                    val = M_Node.scrubVal(val, this);

                }
            } else if (val === null) {
                val = null; // IE: DOM null is not true null (even though they ===)
            }
            return val;
        },
        /**
         * 设置原生节点属性
         * @param {String} attr 原生节点属性
         * @param {String | Object} val  原生节点属性对应值
         */
        set: function(attr, val) {
            var attrConfig = M_Node.attrFix[attr];

            if (attrConfig && attrConfig.setter) {
                attrConfig.setter.call(this, val, attr);
            } else if (re_aria.test(attr)) { // special case Aria
                this._node.setAttribute(attr, val);
            } else {
                M_Node.DEFAULT_SETTER.apply(this, arguments);
            }
            
            return this;
        },
        /**
         * 获取原生节点
         * @return {HTMLelement} 原生节点
         */
        getDOMNode: function() {
            return this._node;
        }
    }
    M.extend(M.Node, nodeCls);
});