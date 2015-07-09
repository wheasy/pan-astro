/**
 * 节点基础操作
 */
Mo.define('dom', function(M) {

    M.namespace('DOM');

    var OWNER_DOCUMENT = 'ownerDocument',
        GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect',
        DOCUMENT_ELEMENT = 'documentElement',
        documentElement = M.config.doc.documentElement,
        COMPAT_MODE = 'compatMode',
        STR_NODE_TYPE = 'nodeType',
        STR_TAG_NAME = 'tagName',
        STR_PARENT_NODE = 'parentNode',
        STR_CONTAINS = 'contains',
        EMPTY_ARRAY = [],
        _bruteContains = function(element, needle) {
            while (needle) {
                if (element === needle) {
                    return true;
                }
                needle = needle.parentNode;
            }
            return false;
        };
    // IE < 8 throws on node.contains(textNode)
    var supportsContainsTextNode = (function() {
        var node = M.config.doc.createElement('div'),
            textNode = node.appendChild(M.config.doc.createTextNode('')),
            result = false;

        try {
            result = node.contains(textNode);
        } catch (e) {}

        return result;
    })();
    
    var DOM = {

        /**
         * 通过ID获取节点
         * @param {String} id 节点ID
         * @param {Object} doc 父节点，默认是document
         * @return {HTMLElement | null} HTMLElement或者null
         */
        byId: function(id, doc) {
            // handle dupe IDs and IE name collision
            return DOM.allById(id, doc)[0] || null;
        },
        /**
         * 获取节点ID
         * @param  {Object} node 
         * @return {String} 节点ID  
         */
        getId: function(node) {
            var id;
            if (node.id && !node.id.tagName && !node.id.item) {
                id = node.id;
            } else if (node.attributes && node.attributes.id) {
                id = node.attributes.id.value;
            }

            return id;
        },
        /**
         * 设置节点ID
         * @param {Object} node 节点
         * @param {String} id   节点ID
         */
        setId: function(node, id) {
            if (node.setAttribute) {
                node.setAttribute('id', id);
            } else {
                node.id = id;
            }
        },
        /**
         * 查找父节点
         * @param  {Object}   element  基础节点
         * @param  {Function} [fn]       父节点需要满足的函数必须返回true和false
         * @param  {Boolean}   [testSelf] 是否用fn检测当前节点
         * @param  {Function}   [stopFn]   是否需要停止查找函数必须返回true和false
         * @return {HTMLElement | null}            返回父节点
         */
        ancestor: function(element, fn, testSelf, stopFn) {
            var ret = null;
            if (testSelf) {
                ret = (!fn || fn(element)) ? element: null;

            }
            return ret || DOM.elementByAxis(element, STR_PARENT_NODE, fn, null, stopFn);
        },
        /**
         * 返回父节点数组
         * @param  {Object}   element  基础节点
         * @param  {Function} [fn]       父节点需要满足的函数必须返回true和false
         * @param  {Boolean}   [testSelf] 是否用fn检测当前节点
         * @param  {Function}   [stopFn]   是否需要停止查找函数必须返回true和false
         * @return {Array}            返回父节点数组
         */
        ancestors: function(element, fn, testSelf, stopFn) {
            var ancestor = element,
            ret = [];
            //递归查找父节点，把满足的节点插入ret
            while ((ancestor = DOM.ancestor(ancestor._node || ancestor, fn, testSelf, stopFn))) {
                testSelf = false;
                if (ancestor) {
                    ret.unshift(ancestor);

                    if (stopFn && stopFn(ancestor)) {
                        return ret;
                    }
                }
            }
            return ret;
        },
        /**
         * 按照一定规则查找节点的实现
         * @param  {Object}   element 基础节点
         * @param  {String}   axis    查找节点的方法 nextSibling：下一个节点  previousSibling：上一个节点
         * @param  {Function} fn      节点需要满足的函数必须返回true和false|默认为空
         * @param  {Boolean}   all     ?
         * @param  {Function}   stopAt  是否需要停止查找函数必须返回true和false|默认为空
         * @return {HTMLElement | null}           返回父节点
         */
        elementByAxis: function(element, axis, fn, all, stopAt) {
            while (element && (element = element[axis])) { // NOTE: assignment
                if ((all || element['tagName']) && (!fn || fn(element))) {
                    return element;
                }

                if (stopAt && stopAt(element)) {
                    return null;
                }
            }
            return null;
        },
        /**
         * 判断一个节点是否在另一个节点之内
         * @param  {Object} element 基础节点
         * @param  {Object} needle  判断节点
         * @return {Boolean}        
         */
        contains: function(element, needle) {
            var ret = false;

            if (!needle || !element || !needle[STR_NODE_TYPE] || !element[STR_NODE_TYPE]) {
                ret = false;
            } else if (element[STR_CONTAINS] &&
            // IE < 8 throws on node.contains(textNode) so fall back to brute.
            // Falling back for other nodeTypes as well.
            (needle[STR_NODE_TYPE] === 1 || supportsContainsTextNode)) {
                ret = element[STR_CONTAINS](needle);
            } else if (element[COMPARE_DOCUMENT_POSITION]) {
                // Match contains behavior (node.contains(node) === true).
                // Needed for Firefox < 4.
                if (element === needle || !!(element[COMPARE_DOCUMENT_POSITION](needle) & 16)) {
                    ret = true;
                }
            } else {
                ret = _bruteContains(element, needle);
            }

            return ret;
        },
        /**
         * 判断节点是否在document内
         * @param  {Object} element 基础节点
         * @param  {Object} doc     文档范围|默认为document
         * @return {Boolean}         返回
         */
        inDoc: function(element, doc) {
            var ret = false,
            rootNode;

            if (element && element.nodeType) { (doc) || (doc = element[OWNER_DOCUMENT]);

                rootNode = doc[DOCUMENT_ELEMENT];

                // contains only works with HTML_ELEMENT
                if (rootNode && rootNode.contains && element.tagName) {
                    ret = rootNode.contains(element);
                } else {
                    ret = DOM.contains(rootNode, element);
                }
            }

            return ret;

        },
        /**
         * 获取所有ID
         * @param  {String} id   节点ID
         * @param  {Object} root 搜索范围默认为document
         * @return {Array}       数组
         */
        allById: function(id, root) {
            root = root || M.config.doc;
            var nodes = [],
                ret = [],
                i,
                node;

            if (root.querySelectorAll) {
                ret = root.querySelectorAll('[id="' + id + '"]');
            } else if (root.all) {
                nodes = root.all(id);

                if (nodes) {
                    // root.all may return HTMLElement or HTMLCollection.
                    // some elements are also HTMLCollection (FORM, SELECT).
                    if (nodes.nodeName) {
                        if (nodes.id === id) { // avoid false positive on name
                            ret.push(nodes);
                            nodes = EMPTY_ARRAY; // done, no need to filter
                        } else { //  prep for filtering
                            nodes = [nodes];
                        }
                    }

                    if (nodes.length) {
                        // filter out matches on node.name
                        // and element.id as reference to element with id === 'id'
                        for (i = 0; node = nodes[i++];) {
                            if (node.id === id  ||
                                    (node.attributes && node.attributes.id &&
                                    node.attributes.id.value === id)) {
                                ret.push(node);
                            }
                        }
                    }
                }
            } else {
                ret = [DOM._getDoc(root).getElementById(id)];
            }

            return ret;
       },
       /**
        * 获取同级几点
        * @param  {Object}   node 基础节点
        * @param  {Function} fn   节点需要满足的方法。默认为空
        * @return {Array}        满足要求的同级节点数组
        */
        siblings: function(node, fn) {
            var nodes = [],
            sibling = node;

            while ((sibling = sibling['previousSibling'])) {
                if (sibling['tagName'] && (!fn || fn(sibling))) {
                    nodes.unshift(sibling);
                }
            }

            sibling = node;
            while ((sibling = sibling['nextSibling'])) {
                if (sibling['tagName'] && (!fn || fn(sibling))) {
                    nodes.push(sibling);
                }
            }

            return nodes;
        },
        /**
         * 获取节点所在document
         * @param  {Object} element 基础节点，可以为空
         * @return {Object}         document
         */
        _getDoc: function(element) {
            var doc = M.config.doc;
            if (element) {
                doc = (element[STR_NODE_TYPE] === 9) ? element: // element === document
                element[OWNER_DOCUMENT] || // element === DOM node
                element.document || // element === window
                M.config.doc; // default
            }

            return doc;
        },
        /**
         * 返回子元素
         * @param  {Object} node 基础节点
         * @param  {String} tag  子元素tagname，可选
         * @return {Array}       符合tag的子节点数组
         */
        _children: function(node, tag) {
            var i = 0,
            children = node.children,
            childNodes,
            hasComments,
            child;

            if (children && children.tags) { // use tags filter when possible
                if (tag) {
                    children = node.children.tags(tag);
                } else { // IE leaks comments into children
                    hasComments = children.tags('!').length;
                }
            }

            if (!children || (!children.tags && tag) || hasComments) {
                childNodes = children || node.childNodes;
                children = [];
                while ((child = childNodes[i++])) {
                    if (child.nodeType === 1) {
                        if (!tag || tag === child.tagName) {
                            children.push(child);
                        }
                    }
                }
            }

            return children || [];
        }
    };
    //混合到M.DOM
    M.mix(M.DOM, DOM);
    
});

