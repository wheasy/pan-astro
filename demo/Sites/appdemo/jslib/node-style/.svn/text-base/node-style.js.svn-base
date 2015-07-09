/**
 * css相关操作封装
 * 
 * 用节点的style属性对css进行操作
 * 如果style的属性为空，则用getComputedStyle方法获取渲染后的css
 * getComputedStyle已支持主流浏览器，
 * 兼容性：PC端使用需要添加对IE6,7,8的兼容
 */
Mo.define('node-style', function(M) {
    var Lang = M.Lang,
        M_DOM = M.DOM,
        CUSTOM_STYLES = {},
        re_unit = /width|height|top|left|right|bottom|margin|padding/i,
        GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect',
        OWNER_DOCUMENT = 'ownerDocument',
        STR_STYLE = 'style',
        DOCUMENT_ELEMENT = 'documentElement',
        STR_DEFAULT_VIEW = 'defaultView',
        STR_GET_COMPUTED_STYLE = 'getComputedStyle',
        DEFAULT_UNIT = 'px',
        STR_FLOAT = 'float',
        CSS_FLOAT = 'cssFloat',
        STYLE_FLOAT = 'styleFloat',
        TOP = 'top',
        LEFT = 'left',
        BOTTOM = 'bottom',
        RIGHT = 'right',
        POSITION = 'position',
        FIXED = 'fixed',
        COMPAT_MODE = 'compatMode',
        _BACK_COMPAT = 'BackCompat',
        SCROLL_NODE = null;
        DOC = M.config.doc,
        get_computed_style = function(node, att) {
            var val = '',
                doc = node[OWNER_DOCUMENT],
                computed;

            if (node[STR_STYLE] && doc[STR_DEFAULT_VIEW] && doc[STR_DEFAULT_VIEW][STR_GET_COMPUTED_STYLE]) {
                computed = doc[STR_DEFAULT_VIEW][STR_GET_COMPUTED_STYLE](node, null);
                if (computed) { // FF may be null in some cases (ticket #2530548)
                    val = computed[att];
                }
            }
            return val;
        };
    //初始化CUSTOM_STYLES
    if (!Lang.isUndefined(DOC[DOCUMENT_ELEMENT][STR_STYLE][CSS_FLOAT])) {
        CUSTOM_STYLES[STR_FLOAT] = CSS_FLOAT;
    } else if (!Lang.isUndefined(DOC[DOCUMENT_ELEMENT][STR_STYLE][STYLE_FLOAT])) {
        CUSTOM_STYLES[STR_FLOAT] = STYLE_FLOAT;
    }
    M.DOM.CUSTOM_STYLES = CUSTOM_STYLES;
    // TODO ？不存在re_color
    if (M.UA.opera) {
        get_computed_style = function(node, att) {
            var view = node[OWNER_DOCUMENT][STR_DEFAULT_VIEW],
                val = view[STR_GET_COMPUTED_STYLE](node, '')[att];
            //TODO fix operate
            if (re_color.test(att)) {
                val = Y.Color.toRGB(val);
            }
            return val;
        };

    }
    // webkit内核获取background-color为transparent时会输出rgba(0, 0, 0, 0)
    if (M.UA.webkit) {
        get_computed_style = function(node, att) {
            var view = node[OWNER_DOCUMENT][STR_DEFAULT_VIEW],
                val = view[STR_GET_COMPUTED_STYLE](node, '')[att];
            if (val === 'rgba(0, 0, 0, 0)') {
                val = 'transparent';
            }
            return val;
        }
    }
    //创建样式管理器
	var styleManager = {
        /**
         * 设置节点的css值
         * @param {Object} el    操作节点
         * @param {String} att   css属性
         * @param {String} val   css值
         */
        set: function(el, att, val) {
            var style = el.style;
            if (style) {
                if (val === null || val === '') { // normalize unsetting
                    val = '';
                } else if (!isNaN(new Number(val)) && re_unit.test(att)) { // number values may need a unit
                    val += DEFAULT_UNIT;
                }
                //debugger
                if (att in CUSTOM_STYLES) {
                    if (CUSTOM_STYLES[att].set) {
                        CUSTOM_STYLES[att].set(el, val, style);
                        return; // NOTE: return
                    } else if (typeof CUSTOM_STYLES[att] === 'string') {
                        att = CUSTOM_STYLES[att];
                    }
                } else if (att === '') { // unset inline styles
                    att = 'cssText';
                    val = '';
                }
                try {
                    style[att] = val;
                } catch (err) {
                    M.log('error', err);
                    M.log('info', el);
                    M.log('info', 'att:' + att + '    val:' + val);
                    M.log('info', 'end');

                }
            }
        },
        get: function(el, att, style) {
            style = style || el.style;
            var val = '';

            if (style) {
                if (att in CUSTOM_STYLES) {
                    if (CUSTOM_STYLES[att].get) {
                        return CUSTOM_STYLES[att].get(el, att, style); // NOTE: return
                    } else if (typeof CUSTOM_STYLES[att] === 'string') {
                        att = CUSTOM_STYLES[att];
                    }
                }
                val = style[att];
                if (val === '') { // TODO: is empty string sufficient?
                    val = get_computed_style(el, att);
                }
            }
            return val;
        },
        setX: function(node, x) {
            return styleManager.setXY(node, [x, null]);
        },
        setY: function(node, y) {
            return styleManager.setXY(node, [null, y]);
        },
        setXY: function(node, xy, noRetry) {
            var setStyle = styleManager.set,
                pos, delta, newXY, currentXY;

            if (node && xy) {
                pos = styleManager.get(node, 'position');

                delta = styleManager._getOffset(node);
                if (pos == 'static') { // default to relative
                    pos = 'relative';
                    setStyle(node, POSITION, pos);
                }
                currentXY = styleManager.getXY(node);
                try {
                    if (xy[0] !== null) {
                        setStyle(node, LEFT, xy[0] - currentXY[0] + delta[0] + 'px');
                    }

                    if (xy[1] !== null) {
                        setStyle(node, TOP, xy[1] - currentXY[1] + delta[1] + 'px');
                    }
                } catch (ee) {
                    debugger
                }
                if (!noRetry) {
                    newXY = styleManager.getXY(node);
                    if (newXY[0] !== xy[0] || newXY[1] !== xy[1]) {
                        styleManager.setXY(node, xy, true);
                    }
                }

            } else {}
        },
        getXY: function() {
            if (M.config.doc[DOCUMENT_ELEMENT][GET_BOUNDING_CLIENT_RECT]) {
                return function(node) {
                    var xy = null,
                        scrollLeft, scrollTop, mode, box, offX, offY, doc, win, inDoc, rootNode;

                    if (node && node.tagName) {
                        doc = node.ownerDocument;
                        mode = doc[COMPAT_MODE];

                        if (mode !== _BACK_COMPAT) {
                            rootNode = doc[DOCUMENT_ELEMENT];
                        } else {
                            rootNode = doc.body;
                        }

                        // inline inDoc check for perf
                        if (rootNode.contains) {
                            inDoc = rootNode.contains(node);
                        } else {
                            inDoc = M_DOM.contains(rootNode, node);
                        }

                        if (inDoc) {
                            win = doc.defaultView;

                            // inline scroll calc for perf
                            if (win && 'pageXOffset' in win) {
                                scrollLeft = win.pageXOffset;
                                scrollTop = win.pageYOffset;
                            } else {
                                scrollLeft = (SCROLL_NODE) ? doc[SCROLL_NODE].scrollLeft : M_DOM.docScrollX(node, doc);
                                scrollTop = (SCROLL_NODE) ? doc[SCROLL_NODE].scrollTop : M_DOM.docScrollY(node, doc);
                            }
                            
                            box = node[GET_BOUNDING_CLIENT_RECT]();
                            xy = [box.left, box.top];

                            if (offX || offY) {
                                xy[0] -= offX;
                                xy[1] -= offY;

                            }
                            if ((scrollTop || scrollLeft)) {
                                if (!M.UA.ios || (M.UA.ios >= 4.2)) {
                                    xy[0] += scrollLeft;
                                    xy[1] += scrollTop;
                                }

                            }
                        } else {
                            xy = styleManager._getOffset(node);
                        }
                    }
                    return xy;
                };
            } else {
                return function(node) {
                    // manually calculate by crawling up offsetParents
                    //Calculate the Top and Left border sizes (assumes pixels)
                    var xy = null,
                        doc, parentNode, bCheck, scrollTop, scrollLeft;

                    if (node) {
                        if (M_DOM.inDoc(node)) {
                            xy = [node.offsetLeft, node.offsetTop];
                            doc = node.ownerDocument;
                            parentNode = node;
                            // TODO: refactor with !! or just falsey
                            bCheck = ((M.UA.gecko || M.UA.webkit > 519) ? true : false);

                            // TODO: worth refactoring for TOP/LEFT only?
                            while ((parentNode = parentNode.offsetParent)) {
                                xy[0] += parentNode.offsetLeft;
                                xy[1] += parentNode.offsetTop;
                                if (bCheck) {
                                    xy = styleManager._calcBorders(parentNode, xy);
                                }
                            }

                            // account for any scrolled ancestors
                            if (styleManager.get(node, POSITION) != FIXED) {
                                parentNode = node;

                                while ((parentNode = parentNode.parentNode)) {
                                    scrollTop = parentNode.scrollTop;
                                    scrollLeft = parentNode.scrollLeft;

                                    //Firefox does something funky with borders when overflow is not visible.
                                    if (M.UA.gecko && (styleManager.get(parentNode, 'overflow') !== 'visible')) {
                                        xy = styleManager._calcBorders(parentNode, xy);
                                    }

                                    if (scrollTop || scrollLeft) {
                                        xy[0] -= scrollLeft;
                                        xy[1] -= scrollTop;
                                    }
                                }
                                xy[0] += M_DOM.docScrollX(node, doc);
                                xy[1] += M_DOM.docScrollY(node, doc);

                            } else {
                                //Fix FIXED position -- add scrollbars
                                xy[0] += M_DOM.docScrollX(node, doc);
                                xy[1] += M_DOM.docScrollY(node, doc);
                            }
                        } else {
                            xy = styleManager._getOffset(node);
                        }
                    }

                    return xy;
                };
            }
        }(),
        getY: function(node) {
            return styleManager.getXY(node)[1];
        },
        getX: function(node) {
            return styleManager.getXY(node)[0];
        },
        /**
         * 计算节点边框
         * @param  {type} node [description]
         * @param  {type} xy2  [description]
         * @return {type}      [description]
         */
        _calcBorders: function(node, xy2) {
            var t = parseInt(get_computed_style(node, 'borderTopWidth'), 10) || 0,
            l = parseInt(get_computed_style(node, 'borderLeftWidth'), 10) || 0;
            if (M.UA.gecko) {
                if (node.tagName) {
                    t = 0;
                    l = 0;
                }
            }
            xy2[0] += l;
            xy2[1] += t;
            return xy2;
        },
        _getOffset: function(node) {
            var pos, xy = null;

            if (node) {
                pos = styleManager.get(node, 'position');
                xy = [parseInt(get_computed_style(node, 'left'), 10), parseInt(get_computed_style(node, 'top'), 10)];

                if (isNaN(xy[0])) { // in case of 'auto'
                    xy[0] = parseInt(styleManager.get(node, 'left'), 10); // try inline
                    if (isNaN(xy[0])) { // default to offset value
                        xy[0] = (pos === 'relative') ? 0 : node.offsetLeft || 0;
                    }
                }

                if (isNaN(xy[1])) { // in case of 'auto'
                    xy[1] = parseInt(styleManager.get(node, 'top'), 10); // try inline
                    if (isNaN(xy[1])) { // default to offset value
                        xy[1] = (pos === 'relative') ? 0 : node.offsetTop || 0;
                    }
                }
            }
            return xy;
        },
        region: function(node) {
            var xy = styleManager.getXY(node),
                ret = false;

            if (node && xy) {
                ret = styleManager._getRegion(xy[1], // top
                    xy[0] + node.offsetWidth, // right
                    xy[1] + node.offsetHeight, // bottom
                    xy[0] // left
                );
            }

            return ret;
        },
        inRegion: function(node, node2, all, altRegion) {
            var region = {},
                r = altRegion || styleManager.region(node),
                n = node2,
                off;

            if (n.tagName) {
                region = styleManager.region(n);
            } else if (Lang.isObject(node2)) {
                region = node2;
            } else {
                return false;
            }

            if (all) {
                return (r[LEFT] >= region[LEFT] && r[RIGHT] <= region[RIGHT] && r[TOP] >= region[TOP] && r[BOTTOM] <= region[BOTTOM]);
            } else {
                off = getOffsets(region, r);
                if (off[BOTTOM] >= off[TOP] && off[RIGHT] >= off[LEFT]) {
                    return true;
                } else {
                    return false;
                }

            }
        },
        inViewportRegion: function(node, all, altRegion) {
            return styleManager.inRegion(node, styleManager.viewportRegion(node), all, altRegion);
        },
        _getRegion: function(t, r, b, l) {
            var region = {};

            region[TOP] = region[1] = t;
            region[LEFT] = region[0] = l;
            region[BOTTOM] = b;
            region[RIGHT] = r;
            region.width = region[RIGHT] - region[LEFT];
            region.height = region[BOTTOM] - region[TOP];

            return region;
        },
        viewportRegion: function(node) {
            node = node || M.config.doc.documentElement;
            var ret = false,
                scrollX, scrollY;

            if (node) {
                scrollX = M_DOM.docScrollX(node);
                scrollY = M_DOM.docScrollY(node);

                ret = styleManager._getRegion(scrollY, // top
                    M_DOM.winWidth(node) + scrollX, // right
                    scrollY + M_DOM.winHeight(node), // bottom
                    scrollX); // left
            }

            return ret;
        }
    };
    M.styleManager = styleManager;
    /**
    * 节点css相关操作
    * @lends M.Node.prototype
    */
    var nodeStyle = {
    	/**
         * 设置节点CSS
         * @param {String} attr  css属性
         * @param {String} value css值
         * @return {Object} mojs节点
         */
        setStyle: function(attr, value) {
            styleManager.set(this._node, attr, value);
            return this;
        },
        /**
         * 设置一组节点CSS
         * @param {Object} attr  css键值对集合
         * @return {Object} mojs节点 
         */
        setStyles: function(attrs) {
            var el = this._node;
            M.each(attrs, function(value, attr) {
                styleManager.set(el, attr, value);
            });
            return this;
        },
        /**
         * 获取节点css值
         * @param  {String} attr css属性
         * @return {Object}      mojs节点
         */
        getStyle: function(attr) {
            return styleManager.get(this._node, attr);
        },
        /**
         * 显示节点
         * @return {Object}      mojs节点
         */
        show: function() {
            var self = this;
            self.removeAttr('hidden');
            self.setStyle('display', '');
            return self;
        },
        /**
         * 显示隐藏节点
         * @return {Object}      mojs节点
         */
        toggle: function() {
            var self = this;
            if (self.getStyle('display') == 'none') {
                self.show();
                return
            }
            self.hide();
        },
        /**
         * 隐藏节点
         * @return {Object}      mojs节点
         */
        hide: function() {
            var self = this;
            self.setAttr('hidden', true);
            self.setStyle('display', 'none');
            return this;
        },
        /**
         * 设置节点X坐标
         * @param {Int} x 坐标值
         */
        setX: function(x) {
            this.setXY(x, null);
        },
        /**
         * 设置节点Y坐标
         * @param {Int} y 坐标值
         */
        setY: function(y) {
            this.setXY(null, y);
        },
        /**
         * 设置节点XY坐标
         * @param {type} x x坐标值
         * @param {type} y y坐标值
         */
        setXY: function(x, y) {
            styleManager.setXY(this._node, [x, y]);
        },
        /**
         * 获取节点position属性
         * @return {String} position属性
         */
        getPosition: function() {
            return styleManager._getOffset(this._node);
        },
        /**
         * 获取节点xy值
         * @return {Array} xy[0]为X坐标，xy[1]为Y坐标
         */
        getXY: function() {
            return styleManager.getXY(this._node);
        },
        /**
         * 获取节点x值
         * @return {Int} x坐标值
         */
        getX: function() {
            return this.getXY()[0];
        },
        /**
         * 获取节点y值
         * @return {Int} y坐标值
         */
        getY: function() {
            return this.getXY()[1];
        }
    }

    M.extend(M.Node, nodeStyle);
    var M_Node = M.Node;
    M.extend(M_Node.attrFix,{
        viewportRegion: {
            getter: function() {
                return styleManager.viewportRegion(this.getDOMNode());
            }
        },
        region: {
            getter: function() {
                var node = this.getDOMNode(),
                    region;

                if (node && !node.tagName) {
                    if (node.nodeType === 9) { // document
                        node = node.documentElement;
                    }
                }
                if (M_Node.isWindow(node)) {
                    region = styleManager.viewportRegion(node);
                } else {
                    region = styleManager.region(node);
                }
                return region;
            }
        }
    });

});