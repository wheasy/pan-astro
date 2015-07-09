Mo.define('moto', function(M) {
    var L = M.Lang;
    var win = M.one(M.config.win);
    var moto = {};
    var app = function() {
        this.initDataByAttrs();
        this.init.apply(this, arguments);
        return this;
    };
    M.$Swap = {};
    M.extend(app, M.EventTarget);
    M.extend(app, M.Base, /** @lends Mt.App */ {
        /**
         * 可通过 {@link Mt.createApp} 方法创建实例
         * @constructs Mt.App
         * @example
         * var app = Mt.createApp();
         *
         * var app = Mt.createApp(M.one('app-box'),{
         *     portrait:false,
         *     router:[
         *         '/home': {
         *             view: 'demo',
         *             title: '首页',
         *             isHome: true
         *         },
         *         '/user/:uid': {
         *             view: 'url',
         *             title: '用户详情'
         *         }
         *     ]
         * });
         *
         * @param  {Object} [container] app渲染的容器
         * @param  {Object} cfg       配置
         * @param  {Boolean} [cfg.portrait=true] 是否强制横屏
         * @param  {Boolean} [cfg.title=null] 应用标题
         * @param  {Array} [cfg.router] 路由
         *
         * @return {Object}           APP实例
         */
        init: function(container, cfg) {
            var self = this;

            if (container && !container._node) {
                cfg = container;
                container = null;
            } else {
                if (!L.verify(!!container || !!cfg, 'app 初始化未设置参数!')) {
                    return null;
                }
                cfg = cfg || {};
            }
            //屏蔽横屏
            if (cfg.portrait !== false) {
                (function() {
                    var mbody = M.one('body');
                    var supportsOrientationChange = "onorientationchange" in window,
                        orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";
                    mbody.append('<div class="landscape-tips"><i class="m-icon i-flip"></i><p>请切换到竖屏浏览</p></div>');

                    function heng() {
                        if (M.UA.ios > 0 && M.UA.ipad == 0) {
                            if (Math.abs(window.orientation) == 90) {
                                mbody.addClass('landscape-tips-body');

                            } else {
                                mbody.removeClass('landscape-tips-body');

                            }
                        } else if (M.UA.ipad > 0) {
                            return;
                        } else {
                            if (Math.abs(window.orientation) == 90) {
                                mbody.addClass('landscape-tips-body');

                            } else {
                                mbody.removeClass('landscape-tips-body');

                            }
                        }
                    }
                    heng();
                    window.addEventListener(orientationEvent, heng, false);
                }())
            }
            //屏蔽横屏 END            
            if (!L.verify(L.isObject(cfg.router), 'app 未设置路由！')) {
                return null;
            };

            container = container || M.role('moto-app');
            this.set('routerBase', L.isUndefined(cfg.routerBase) ? null : cfg.routerBase);
            this.set('title', L.isUndefined(cfg.title) ? null : cfg.title);

            return L.verify(container, '页面上未到APP容器div[data-role=moto-app]', function() {
                /**
                 * @property {Node} state 应用的容器
                 */
                self.state = container;
                self.viewContainer = container;
                self.router = new Mt.Router(self, cfg.router)
            });
        },
        /**
         * 设置应用标题
         * @param {String} title 标题
         */
        setTitle: function(title) {
            var self = this;
            document.title = title;
            // document.title = (title ? title + ' － ' : '') + self.get('title');
        }
    });
    M.extend(moto, M.EventTarget);
    /**
     * 创建一个App，参数参考考{@link app}
     * @function createApp 
     * @memberof Mt
     * @static
     */
    moto.createApp = function() {
        var args = arguments;
        var a = new app(args[0], args[1]);
        M.one(window).fire('mhashChange', a.router);
        return a;
    };



    /**
     * 定义Moto插件
     * @static
     * @memberOf Mt
     * @param  {String} name 插件名称
     * @param  {Object} cfg  插件配置
     */
    moto.plug = function(name, cfg) {
        M.plugin('mt-' + name, cfg);
    };
    var width = Math.min(win.get('region').width, win.get('region').width);
    if (M.UA.iphone > 0) {
        M.one('body').append('<style>.dr-header-bar, .s-witdh {width:' + width + 'px !important}</style>')
    }
    // if(M.UA.ios > 0){
    //     M.one('body').addClass('ios');
    // }
    if (M.UA.ipad > 0) {
        M.one('body').addClass('ipad');
    }
    window.Mt = moto;
    Mt.App = app;

});