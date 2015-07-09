/**
 * 节点扩展操作
 */
Mo.define('dom-extend', function(M) {
	var DOCUMENT_ELEMENT = 'documentElement',
		COMPAT_MODE = 'compatMode',
        STR_TAG_NAME = 'tagName',
        OWNER_DOCUMENT = 'ownerDocument',
		documentElement = M.config.doc.documentElement;

    var getOffsets = function(r1, r2) {
        var t = Math.max(r1[TOP], r2[TOP]),
            r = Math.min(r1[RIGHT], r2[RIGHT]),
            b = Math.min(r1[BOTTOM], r2[BOTTOM]),
            l = Math.max(r1[LEFT], r2[LEFT]),
            ret = {};

        ret[TOP] = t;
        ret[RIGHT] = r;
        ret[BOTTOM] = b;
        ret[LEFT] = l;
        return ret;
    };
    var M_DOM = M.DOM;
    M.extend(M.DOM, {
        //TODO特殊的元素值设置，不能通过value=形式设置，如select
        VALUE_SETTERS: {
            button: function(node, val) {
                var attr = node.attributes.value;
                if (!attr) {
                    attr = node[OWNER_DOCUMENT].createAttribute('value');
                    node.setAttributeNode(attr);
                }

                attr.value = val;
            },
            select: function(node, val) {
                for (var i = 0,
                        options = node.getElementsByTagName('option'), option; option = options[i++];) {
                    if (M_DOM.getValue(option) === val) {
                        option.selected = true;
                        //Y_DOM.setAttribute(option, 'selected', 'selected');
                        break;
                    }
                }
            }
        },
        VALUE_GETTERS: {
            option: function(node) {
                var attrs = node.attributes;
                return (attrs.value && attrs.value.specified) ? node.value : node.text;
            },

            select: function(node) {
                var val = node.value,
                    options = node.options;

                if (options && options.length) {
                    // TODO: implement multipe select
                    if (node.multiple) {} else if (node.selectedIndex > -1) {
                        val = M_DOM.getValue(options[node.selectedIndex]);
                    }
                }

                return val;
            },
            button: function(node) {
                return (node.attributes && node.attributes.value) ? node.attributes.value.value : '';
            }
        },
        winWidth: function(node) {
            var w = M_DOM._getWinSize(node).width;
            return w;
        },
        winHeight: function(node) {
            var h = M_DOM._getWinSize(node).height;
            return h;
        },
        _getWinSize: function(node, doc) {
            doc = doc || (node) ? M_DOM._getDoc(node) : M.config.doc;
            var win = doc.defaultView || doc.parentWindow,
                mode = doc[COMPAT_MODE],
                h = win.innerHeight,
                w = win.innerWidth,
                root = doc[DOCUMENT_ELEMENT];

            if (mode && !M.UA.opera) { // IE, Gecko
                if (mode != 'CSS1Compat') { // Quirks
                    root = doc.body;
                }
                h = root.clientHeight;
                w = root.clientWidth;
            }
            return {
                height: h,
                width: w
            };
        },
        
        
        docScrollX: function(node, doc) {
            doc = doc || (node) ? M_DOM._getDoc(node) : M.config.doc; // perf optimization
            var dv = doc.defaultView,
                pageOffset = (dv) ? dv.pageXOffset : 0;
            return Math.max(doc[DOCUMENT_ELEMENT].scrollLeft, doc.body.scrollLeft, pageOffset);
        },
        docScrollY: function(node, doc) {
            doc = doc || (node) ? M_DOM._getDoc(node) : M.config.doc; // perf optimization
            var dv = doc.defaultView,
                pageOffset = (dv) ? dv.pageYOffset : 0;
            return Math.max(doc[DOCUMENT_ELEMENT].scrollTop, doc.body.scrollTop, pageOffset);
        },
        getValue: function(node) {
            var ret = '',
                // TODO: return null?
                getter;

            if (node && node[STR_TAG_NAME]) {
                getter = M_DOM.VALUE_GETTERS[node[STR_TAG_NAME].toLowerCase()];

                if (getter) {
                    ret = getter(node);
                } else {
                    ret = node.value;
                }
            }

            // workaround for IE8 JSON stringify bug
            // which converts empty string values to null
            if (ret === '') {
                ret = ''; // for real
            }

            return (typeof ret === 'string') ? ret : '';
        },

        setValue: function(node, val) {
            var setter;

            if (node && node[STR_TAG_NAME]) {
                setter = M_DOM.VALUE_SETTERS[node[STR_TAG_NAME].toLowerCase()];

                if (setter) {
                    setter(node, val);
                } else {
                    node.value = val;
                }
            }
        },
        setText: (documentElement.textContent !== undefined) ?
            function(element, content) {
                if (element) {
                    element.textContent = content;
                }
            } : function(element, content) {
                if ('innerText' in element) {
                    element.innerText = content;
                } else if ('nodeValue' in element) {
                    element.nodeValue = content;
                }
            },
        getText: (documentElement.textContent !== undefined) ?
            function(element) {
                var ret = '';
                if (element) {
                    ret = element.textContent;
                }
                return ret || '';
            } : function(element) {
                var ret = '';
                if (element) {
                    ret = element.innerText || element.nodeValue; // might be a textNode
                }
                return ret || '';
            }
    });




});