/**
 * 提供节点相关的操作方法
 * @author wanhu
 * @date: 2013/6/26
 * @namespace M
 * @class M.Node
 * 
 * @lends M.Node.prototype
 */

Mo.define('node', function(M) {
    var prefix = M.config.prefix,
    M_Node = M.Node,
    STR_NODE_TYPE = 'nodeType';

    //继承原生方法
    M.each(['removeChild', 'hasChildNodes', 'cloneNode', 'scrollIntoView', 'getElementsByTagName', 'focus', 'blur', 'submit', 'reset', 'select', 'createCaption'], function(method) {
        M.Node.prototype[method] = function(arg1, arg2, arg3) {
            var ret = this.invoke(method, arg1, arg2, arg3);
            return ret;
        };
    });


     /**
      * 返回(不指定则在文档内查找)第一个匹配选择器的节点，可通过此方法把原生DOM节点转换为方法
      * @method one
      * @static
      * @param {string | HTMLElement | Node} selector 选择器或节点
      * @param {string | HTMLElement | Node} root 选择范围
      * @return {Node | null}
      * @memberOf Mo
      */
    M.one = function(node, root) {
        var instance = null,
        cachedNode, uid;

        if(root&&root.getDOMNode){root=root.getDOMNode();}

        if (node) {
            if (typeof node == 'string') {
                node = M_Node._fromString(node, root);
                if (!node) {
                    return null; // NOTE: return
                }
            } else if (node.getDOMNode) {
                return node; // NOTE: return
            }
            if (node.nodeType || M_Node.isWindow(node)) { // avoid bad input (numbers, boolean, etc)
                uid = (node.uniqueID && node.nodeType !== 9) ? node.uniqueID : node[prefix];

                instance = M_Node._instances[uid]; // reuse exising instances
                cachedNode = instance ? instance._node: null;

                if(!uid){
                    uid = M.stamp(node);
                }

                if (!instance || (cachedNode && node !== cachedNode)) { // new Node when nodes don't match
                    instance = new M_Node(node);
                    if (node.nodeType != 11) { // dont cache document fragment
                        //M_Node._instances[instance[prefix]] = instance; // cache node
                        M_Node._instances[uid] = instance; // cache node
                    }
                }
            }
        }
        return instance;
    }

     /**
      * 返回指定范围内(不指定则在文档内查找)第一个符合选择器 [data-role=roleValue] 的所有节点，

        //code1
        M.one('[data-role=roleValue]')
        //code2
        M.role('roleValue')
        //code1和code2返回值一样

      * @method role
      * @param {string} role role的属性值
      * @param {string|dom|Node} root 选择器限定范围
      * @return {Node | null}
      * @for Mo
      */
    M.role = function(role, root){
        return M.one('[data-role=' + role + ']', root);
    }

     /**
      * 返回当前节点下第一个匹配选择器的节点
      * @method one
      * @param {string | HTMLElement | Node} selector 选择器或节点
      * @param {string | HTMLElement | Node} root 选择范围
      * @return {Node | null}
      * @for Mo.Node
      */
     M.extend(M.Node, {
        one: function(selector){
            return M.one(selector, this._node);
        },
        role:function(selector) {
            return M.role(selector, this._node);
        }
    })
});