/**
 延迟加载组件
*@memberOf M.Plugin
*@class SwitchableLazyLoad
*@date   2013-7-1
*@author shenguozu
*@example
* ele.role('slider').plug([{
        fn: M.Plugin.Switchable,
        cfg: {
            autoplay: false,
            pauseOnHover: true,
            interval: 2,
            circle: true,
            touch: true,
            navCls: 'slider-nav',
            contentCls: 'slider-img',
            activeTriggerCls: 'on',
            viewSize: [width, height]
        }
    }, {
        fn: M.Plugin.SwitchableEffect,
        cfg: {
            relateType: "switchable",
            effect: 'scrollX',
            duration: 0.2,
            circle: true
        }
    }, {
        fn: M.Plugin.SwitchableLazyLoad,
        cfg: {
            relateType: "switchable",
            lazyload: true,
            lazyDataType: 'data-src'
        }
    }]);
    
*/
Mo.define('switchable-lazyload-plugin', function(M) {
    var DATA_TEXTAREA = 'data-textarea', DATA_IMG = 'data-src',
        EVENT_BEFORE_SWITCH = 'beforeSwitch';
    
    var DefaultAttrs = {
        /**
         * @param {Boolean} [cfg.lazyload] 默认为true，即不延迟加载。
         * 
         */
        lazyLoad: true,

        /**
         * @param {String} [cfg.lazyDataType] 默认为data-img，目前支持图片延迟加载，将来支持文本数据和脚步延迟加载。
         * 
         */
        lazyDataType: DATA_IMG // or DATA_TEXTAREA

    };
    M.plugin("SwitchableLazyLoad",/** *@lends M.Plugin.SwitchableLazyLoad*/{
        /**
         * 初始化
         * @param {Object} cfg 参数
         * @param {Boolean} [cfg.lazyload] 默认为true，即不延迟加载
         * @param {String} [cfg.lazyDataType] 默认为data-img，目前支持图片延迟加载，将来支持文本数据和脚步延迟加载。
         */
        init: function(config) {
            var config = config ? M.merge(DefaultAttrs, config) : {};
            var self = this,
                host = config.host,
                lazyLoad = config.lazyLoad,
                type = config.lazyDataType,
                plugHost = host[config.relateType];

            if (!lazyLoad) return;

            var panels = plugHost.panels._nodes;

            plugHost.on(EVENT_BEFORE_SWITCH, loadLazyData);

            /**
             * 加载延迟数据
             */
            function loadLazyData(e) {
                var step = plugHost.config.step,
                    begin = e.index * step,
                    end = begin + step,
                    imgs = panels;

                //上一页轮回
                if(e.direction == 'prev' && e.fromIndex<e.toIndex){
                    var isImg = plugHost.panels.item(0);
                    imgs = isImg.get('tagName') == 'IMG' ? plugHost.panels : isImg.ancestor().all('img');
                    M.inScreen.parse(imgs.item(0));
                    M.inScreen.parse(panels.slice(begin, end));
                }else{
                    M.inScreen.parse(imgs.slice(begin, end));
                }
                // //下一页轮回
                // if(e.direction == 'next' && e.fromIndex>e.toIndex){
                //     var isImg = panels.item(0);
                //     imgs = isImg.get('tagName') == 'IMG' ? plugHost.panels : isImg.ancestor().all('img');
                // }

                

                if (isAllDone()) {
                    plugHost.off(EVENT_BEFORE_SWITCH, loadLazyData);
                }
            }
            /**
             * 是否都已加载完成
             */
            function isAllDone() {
                var imgs,isImg, isDone = true;
                if (type === DATA_IMG) {
                    isImg = plugHost.panels.item(0);
                    imgs = isImg.get('tagName') == 'IMG' ? plugHost.panels : isImg.ancestor().all('img');

                    imgs.each(function(img, index) {
                        if (img.getAttr(type)) {
                            isDone = false;
                            return false;
                        }

                    });
                }
                // TODO textarea

                return isDone;
            }
        }
    });

});
