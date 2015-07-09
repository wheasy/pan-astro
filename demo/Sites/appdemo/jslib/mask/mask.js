/**
 * 全局蒙版组件
 * @lends M
 *
 */
Mo.define('mask', function(M) {
    // var maskList = [];
    var maskDom;
    /**
     * 打开蒙版
     * @param  {Obejct} cfg 蒙版参数
     * @property {Boolean} cfg.click 是否点击自动隐藏，默认为true
     * @property {Number} cfg.zIndex 蒙版z-index值
     * @property {Boolean} cfg.scrollable  是否可以滚动，默认为false
     * @property {Node} cfg.ele  蒙版挂载节点，可选，默认为body
     */
    M.mask = function(cfg) {
        if (!!maskDom) {
            M.mask.hide();
        }
        cfg = M.extend({
            click: true
        }, cfg);
        maskDom = M.Node.create(M.Template.get('mask')());
        var ele = cfg.ele || M.one(document.body);
        // var cbl = cfg.cbl;
        if (cfg.zIndex) {
            maskDom.setStyle('zIndex', cfg.zIndex);
        }
        ele.append(maskDom);
        // M.role('gotop').hide();
        maskDom.setData('cfg', cfg);
        //劫持touch事件
        maskDom.touch('start',function(){
            return;
        })
        if (!cfg.scrollable) {
            M.one('html').addClass('mask_html');
        }
        if (cfg.click) {
            maskDom.on('click', function() {
                M.mask.hide();
            });
        }
    };
    /**
     * 隐藏蒙版
     */
    M.mask.hide = function() {
        if (!maskDom) {
            return;
        }
        var cfg = maskDom.getData('cfg');
        var cbl = cfg.cbl;
        maskDom.remove();
        if (!cfg.scrollable) {
            M.one('html').removeClass('mask_html');
        }
        cbl && cbl();
        maskDom = null;
        M.one(document).fire('scroll');
    }
});