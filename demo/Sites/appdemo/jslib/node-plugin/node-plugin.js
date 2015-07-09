/**
 * 扩展node插件，AOP
 * @lends M.NodeList
 * @author: jiangjibing
 * @date: 2013/6/26
 */


Mo.define('node-plugin',function(M) {

    M.namespace('Plugin');

    var MArray = M.Array;

    M.extend(M.Node, M.Plugin.Host, null, null ,true);
    //M.NodeList.importMethod(M.Node.prototype, ['plug','unplug']);
    /**
     * 为list的元素添加插件
     * @return {NodeList} 返回此列表
     */
    M.NodeList.prototype.plug = function() {        
        var args = arguments,
            self = this;
        M.NodeList.each(this, function(node) {
            //debugger;
            M.Node.prototype.plug.apply(M.one(node), args);

        });
        return this;
    };
    /**
     * 为list的元素删除插件
     * @return {NodeList} 返回此列表
     */
    M.NodeList.prototype.unplug = function() {
        var args = arguments;
        M.NodeList.each(this, function(node) {
            M.Node.prototype.unplug.apply(M.one(node), args);
        });
        return this;
    };


    //M.namespace('Plugin').Base = Plugin;




});
