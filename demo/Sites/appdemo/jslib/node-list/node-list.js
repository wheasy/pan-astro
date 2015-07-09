/**
 * node数组封装，提供常用操作
 * @memberOf M
 * @class NodeList
 */
Mo.define('node-list',function (M) {
    var nodeList = function (nodes, root) {
        var tmp = [];
        if (nodes) {
            if (typeof nodes === 'string') { // selector query
                this._query = nodes;
                nodes = M.Selector.query(nodes, root);
            } else if (nodes.nodeType || M.Node.isWindow(nodes)) { // domNode || window
                nodes = [nodes];
            } else if (nodes._node) { // Y.Node
                nodes = [nodes._node];
            } else if (nodes[0] && nodes[0]._node) { // allow array of Y.Nodes
                M.each(nodes, function(node) {
                    if (node._node) {
                        tmp.push(node._node);
                    }
                });
                nodes = tmp;
            } else { // array of domNodes or domNodeList (no mixed array of Y.Node/domNodes)
                //TODO
                nodes = M.Array.toArray(nodes, 0, true);
            }
        }

        /**
         * The underlying array of DOM nodes bound to the Y.NodeList instance
         * @property _nodes
         * @private
         */
        this._nodes = nodes || [];
    };

    nodeList.getDOMNodes = function(nlist) {
        return (nlist && nlist._nodes) ? nlist._nodes : nlist;
    };

    nodeList.each = function(instance, fn, context) {
        var nodes = instance._nodes;
        if (nodes && nodes.length) {
            M.each(nodes, fn, context || instance);
        } else {
            //M.log('warn','nodeList no nodes bound to ' , instance);
        }
    };
    nodeList.addMethod = function(name, fn, context, newNode) {
        //M.log('info', 'nodeList.addMethod', name)
        if (name && fn) {
            nodeList.prototype[name] = function() {
                var ret = [],
                    args = arguments;

                M.each(this._nodes, function(node) {
                    var UID = (node.uniqueID && node.nodeType !== 9 ) ? 'uniqueID' : 'moid',
                        instance = M.Node._instances[node[UID]],
                        ctx,
                        result;
                    if (!instance) {
                        instance = newNode ? M.one(node) : nodeList._getTempNode(node);
                    }
                    ctx = context || instance;
                    result = fn.apply(ctx, args);
                    if (result !== undefined && result !== instance) {
                        ret[ret.length] = result;
                    }
                });

                // TODO: remove tmp pointer
                return ret.length ? ret : this;
            };
        } else {
            //M.log('warn','node-list:','unable to add method "' + name + '" to nodeList');
        }
    };
    nodeList.importMethod = function(host, name, altName, newDom) {
        if (typeof name === 'string') {
            altName = altName || name;
            nodeList.addMethod(name, host[name], null, newDom);
        } else {
            M.each(name, function(n) {
                nodeList.importMethod(host, n, null, newDom);
            });
        }
    };
    nodeList._getTempNode = function(node) {
        //M.log('info', 'nodeList._getTempNode', name)
        var tmp = nodeList._tempNode;
        if (!tmp) {
            tmp = M.Node.create('<div></div>');
            nodeList._tempNode = tmp;
        }

        tmp._node = node;
        tmp._stateProxy = node;
        return tmp;
    };

    M.extend(nodeList,/** * @lends M.NodeList*/{
       _invoke: function(method, args, getter) {
            var ret = (getter) ? [] : this;

            this.each(function(node) {
                var val = node[method].apply(node, args);
                if (getter) {
                    ret.push(val);
                }
            });

            return ret;
        },
        /**
         * 按照索引获取list内的node节点
         * @param  {Int} index 索引号
         * @return {Node}       node节点
         */
        item: function(index) {
            return M.one((this._nodes || [])[index]);
        },
        /**
         * list内每个元素执行方法        
         * @param  {Function} fn      需要执行的方法   
         * @param  {everything}   context 传递给方法的参数
         * @return {Node}         当前list
         */
        each: function(fn, context) {
            var instance = this;
            M.each(this._nodes, function(node, index) {
                node = M.one(node);
                return fn.call(context || node, node, index, instance);
            });
            return instance;
        },
        /**
         * 判断一个节点的索引
         * @param  {Node} node list内的一个元素
         * @return {Int}      索引值
         */
        indexOf: function(node) {
            return Lang.indexOf(M.Node.getDOMNode(node), this._nodes);
        },
        /**
         * 刷新list内元素，按照上次的超找方式重新查找
         * @return {NodeList} 查找后的List
         */
        refresh: function() {
            var doc,
                nodes = this._nodes,
                query = this._query,
                root = this._queryRoot;

            if (query) {
                if (!root) {
                    if (nodes && nodes[0] && nodes[0].ownerDocument) {
                        root = nodes[0].ownerDocument;
                    }
                }

                this._nodes = M.Selector.query(query, root);
            }

            return this;
        },
        /**
         * 返回List的长度
         * @return {Int} list长度
         */
        size: function() {
            return this._nodes.length;
        },
        /**
         * 判断list是否为空
         * @return {Boolean} 是否为空
         */
        isEmpty: function() {
            return this._nodes.length < 1;
        },
        /**
         * 转换成字符串形式
         */
        toString: function() {
            var str = '',
                errorMsg = this['muid'] + ': not bound to any nodes',
                nodes = this._nodes,
                node;

            if (nodes && nodes[0]) {
                node = nodes[0];
                str += node['nodeName'];
                if (node.id) {
                    str += '#' + node.id;
                }

                if (node.className) {
                    str += '.' + node.className.replace(' ', '.');
                }

                if (nodes.length > 1) {
                    str += '...[' + nodes.length + ' items]';
                }
            }
            return str || errorMsg;
        },
        /**
         * 获取原生节点数组
         * @return {type} [description]
         */
        getDOMNodes: function() {
            return this._nodes;
        },
        /**
         * 过滤
         * @param  {Function |String}  selector 需要满足的函数或者选择器
         * @return {NodeList}          满足条件的nodelist
         */
        filter:function(selector) {
            var ret = [],
                nodes = this._nodes,
                i, node,Lang = M.Lang;

            if (nodes) {
                if(Lang.isString(selector)){
                    for (i = 0; (node = nodes[i++]);) {
                        if (M.Selector.test(node, selector)) {
                            ret[ret.length] = node;
                        }
                    }
                }
                if(Lang.isFunction(selector)){
                    M.each(nodes, function(n, i) {
                        n = M.one(n);
                        if(selector.apply(n,[n, i])){
                            ret[ret.length] = n._node;
                        }
                    });
                }
            } else {
            }
            return M.all(ret);
        }
    });

    nodeList.importMethod(M.Node.prototype, ['append','remove', 'hasClass', 'empty','setHTML','addClass','toggleClass','removeClass','getAttr','removeAttr','setAttr','setAttrs','setStyle','setStyles','getStyle','on','off','fire','delegate','show','hide', 'set', 'get']);
    nodeList.importMethod(M.Node.prototype, ['on','off','fire','delegate'], null, true);
    //M.NodeList.importMethod(M.Node.prototype, ['on','off','fire','delegate']);

    M.NodeList = nodeList;
    /**
     * 为M添加批量选择方法
     * @lends M                        
     */
    
    /**
     * 选择多个节点
     * @param  {String | HTML |dom} nodes 查找的节点
     * @param  {Node} root  选择的节点范围
     * @example
     * ###HTML
     * ```
     * <ul class="list">
     *     <li></li>
     *     <li></li>
     *     <li></li>
     * </ul>
     * ```
     * ###JS
     * var node_list = M.all('.list li');
     * //or
     * //var node_list = M.all('li', M.one('.list'));
     * node_list.addClass('item')
     * ###Result
     * ```
     * //.list 下的所有 li 都加上了 item
     * <ul class="list">
     *     <li class="item"></li>
     *     <li class="item"></li>
     *     <li class="item"></li>
     * </ul>
     * ```
     * @return {NodeList}   满足的全部节点的List
     */
    M.all = function (nodes, root) {
        if(root){
            if(root.getDOMNode){
                root = root.getDOMNode();
            }
            if(root.getDOMNodes){
                root = root.getDOMNodes();
            }
        }
        return new nodeList(nodes, root);
    };
    /**
     * 选择对应data-role的节点list 
     * @param  {String} roles roles名称
     * @param  {Node} root  选择的节点范围
     * @return {NodeList}       满足的全部节点的List
     */
    M.roles = function(roles, root){
        return M.all('[data-role='+roles+']', root)
    }
    /**
     * 为Node添加批量选择方法                    
     */
    M.extend(M.Node, /** @lends M.Node.prototype*/{
        /**
         * 查找子节点
         * @param  {String | HTML |dom} selector 查找的节点
         * @example
         * ###HTML
         * ```
         * <ul class="list">
         *     <li></li>
         *     <li></li>
         *     <li></li>
         * </ul>
         * ```
         * ### JS
         * var list = M.one('.list');
         * list.all('li');
         * 
         * ### Result
         * .list节点下所有的li标签
         * @return {NodeList}   满足的全部节点的List
         */
        all:function(selector) {
            return M.all(selector, this._node);
        },
        /**
         * 按照data-role查找子节点
         * @param  {String} selector roles名称
         * @return {NodeList}   满足的全部节点的List
         */
        roles:function(selector) {
            return M.roles(selector, this._node);
        }
    });
});
