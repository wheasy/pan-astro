Mo.define('moto-router', function(M) {
    var MArrary = M.Arrary,
        L = M.Lang,
        // _regexUrlQuery = /\?([^#]*).*$/,
        // _regexUrlOrigin = /^(?:[^\/#?:]+:\/\/|\/\/)[^\/]*/,
        keys = [],
        _regexPathParam = /([:*])([\w\-]+)?/g,
        h = M.History;
    window._hmt = window._hmt || [];

    var ViewLists = '$navigateList';
    var CURRENT_VIEW = 'CURRENT_VIEW';

    // var urlPrefix = location.pathname.indexOf('/~') > -1 ? '~' : '#';
    /**
     * @constructs Mt.Router
     * @protected
     * @param  {app} app [description]
     * @param  {Object} map 路由图
     */
    function router(app, map) {
        var self = this;
        self[ViewLists] = [];
        self[CURRENT_VIEW] = null;
        self.app = app;

        self._setMap(map);
        M.one('body').delegate('click', function(evt) {
            var hash = h.getHashByUrl(evt.target.href);
            if (hash) {
                var r = self.getMatchs(hash),
                    v = moto.createView(r[0].viewName, false);
                if (v && v.cfg.noPage) {
                    return false;
                }
                if (!v) {
                    M.log('wran', 'body click:未找到名为 ' + r[0].viewName + '的视图 (路由中已配置，但未加载)')
                }
            }
        }, 'a');

        M.one(window).on('mhashChange', afterHashChange, self);
    };
    M.extend(router, /** @lends Mt.Router */{
        /**
         * @property {Boolean} indexInitialized 首页是否已经初始化
         * @readOnly
         */
        indexInitialized: false,
        /**
         * @property {Arrary} map 列表
         * @readOnly
         */
        map: [],
        /**
         * 调转到指定页面
         * @param  {String} url 绝对路径
         * @example
         * // 跳转到首页
         * app.router.redirect('/')
         * // 跳转到详情页
         * app.router.redirect('/detail/1')
         */
        redirect: function(url) {
            var m = this.getMatchs(url);
            if(m.length > 0 && m[0].redirect){
                location.href = '?redirect=' + url;
            }else{
                location.href = (url.indexOf('http') == 0?'':'#')+url;
            }
        },
        /**
         * 清空所有访问历史，销毁所有视图
         */
        clear: function() {
            var self = this;
            history.length = 0;
            // console.log('self[ViewLists].length', self[ViewLists].length);
            M.each(self[ViewLists], function(n, i) {
                // console.log('cleawr');
                n.view.$hide(true, true);
            });
            self[ViewLists].length = 0;
        },
        /**
         * 删除访问历史中的一项
         * @param  {Int} index 索引
         * @todo 待完善
         */
        remove: function(index) {
            var self = this;
            index = index || self[ViewLists].length - 1;
            var n = self[ViewLists][index];
            // M.Array.removeArray(null, self[ViewLists], function(a, b, i) {
            //     return i == index;
            // });
            if (!n) {
                return;
            }
            if (self[CURRENT_VIEW] == n) {
                self[CURRENT_VIEW] = null;
            }
            n.view.$hide(true, true);
            M.Array.removeArray(n, self[ViewLists]);
        },
        /**
         * 返回历史页面
         * @param  {Int} [step=-1] 后退步数
         * @param  {String} [surl] 指定的页面
         */
        back: function(step, surl) {
            // surl = null;
            var self = this;
            var step = step ? step : -1;
            var s = step;
            if (self[ViewLists].length) {
                while (++s <= 0) {
                    self.remove();
                }
                // self.app.hideView(n.view, true);
                // n.box.remove();
                if (self[ViewLists].length > 0) {
                    history.go(step);
                } else {
                    self.redirect(surl || '/');
                }
            } else {
                self.redirect(surl || '/');
            }
        },
        /**
         * 根据地址返回对应路由配置
         * @method getMatchs
         * @private
         * @param  {String}  hash 哈希值 http://astro.com/#/detail  的哈希值是/detail
         * @return {Array}   所有匹配到的路由
         */
        getMatchs: function(hash) {
            if (hash) {
                return M.Array.filter(this.map, function(route) {
                    return hash.search(route.regex) > -1;
                });
            }
            return [];
        },
        _getPath: function() {
            return h.getLocation().pathname;
        },
        /**
         * 获取当前地址
         * @ignore
         * @return {String} 
         */
        _getURL: function() {
            var url = h.getLocation().toString();
            return url;
        },
        /**
         * 根据设置的路由规则，返回正则表达式
         * @param  {String} path 设置的路由规则
         * @param  {Array} keys 传进空数组，路由规则中的参数会push到该数组中
         * @ignore
         * @private
         * @example
         * //假设已配置路由规则
         * ...
         * '/detail/:pid': {
         *       view: 'detail',
         *       title: '详情页'
         *   }
         *...
         *
         * var k = []
         * var r = router._getRegex('/detail/:pid', k);
         * console.log(k);
         * //out ['pid']
         * console.log(k);
         * //out /^\/detail/(.*?)$/
         * @example
         * var k = []
         * var r = router._getRegex('/sub/*', k);
         * console.log(k);
         * //out []
         * console.log(k);
         * //out /^\/sub/.*$/
         * @return {Regex}
         */
        _getRegex: function(path, keys) {
            if (path instanceof RegExp) {
                return path;
            }

            // Special case for catchall paths.
            if (path === '*') {
                return (/.*/);
            }
            path = path.replace(_regexPathParam, function(match, operator, key) {
                // Only `*` operators are supported for key-less matches to allowing
                // in-path wildcards like: '/foo/*'.
                if (!key) {
                    return operator === '*' ? '.*' : match;
                }
                keys.push(key);
                return operator === '*' ? '(.*?)' : '([^/#?]*)';
            });

            return new RegExp('^' + path + '$');

        },
        /**
         * 设置路由配置
         * @param {Array} maps 路由配置表
         * @ignore
         */
        _setMap: function(maps) {
            var self = this;
            var appTitle = self.app.get('title');
            M.each(maps, function(r, v) {
                var keys = [],
                    m = {
                        viewName: r.view, //视图名称
                        uninitView: !!r.uninitView, //是否保持
                        redirect: !!r.redirect, //是否保持
                        hasTab: !!r.hasTab, //是否保持
                        keys: keys, //prodcutid
                        path: v, //product/:productid
                        noHold: r.noHold, //product/:productid
                        noBack: r.noBack, //product/:productid
                        // title: r.title ? (r.title + '—' + appTitle) : appTitle, //product/:productid
                        title: r.title || '', //product/:productid
                        regex: self._getRegex(v, keys)
                            // ,                        spm: r.spm || '0'
                    };
                if (r.isHome) {
                    if (r.homeView) {
                        M.log('wran', '已经指定了Home视图');
                    }
                    self.homeView = m;
                }
                //TODO 判断有没有v,没有则提示
                self.map.push(m);
            });
        }
    });

    function afterHashChange(evt) {
        var self = this,
            app = self.app,
            currentURL = self._getURL(),
            hash = '', //h.getHash() || '/',
            ms = ''; //self.getMatchs(hash);
        // routerBase
        // 多页模式时，app的根路径
        // 单页模式时，如首页地址是：http://astro.com/app#/
        // 多页模式时，如首页地址是：http://astro.com/app/，则routerBase是“app”
        var routerBase = app.get('routerBase');
        hash = h.getHash();
        if (!hash && routerBase != null) {
            //多页模式
            if (L.isUndefined(routerBase)) {
                hash = '/';
            } else {
                hash = location.pathname.replace(routerBase, '');
            }
        }
        if (!hash) {
            hash = '/';
        }
        self.oldHash = evt.oldHash;
        //hash处理分离参数
        var hashObj = M.Lang.parseUrl(hash);
        hash = hashObj.hash;
        ms = self.getMatchs(hash);
        // 百度统计，虚拟pv
        // _hmt.push(['_trackPageview', '/s#' + hash]);
        
        if ((hash === '/') || ms.length === 0) {
            //跳到首页
            self.hash = '/';
            if (self[CURRENT_VIEW]) {
                // app.hideView();
                if (self[CURRENT_VIEW] != self.homeView) {
                    self[CURRENT_VIEW].view.$hide(true, true);
                    M.Array.removeArray(self[CURRENT_VIEW], self[ViewLists]);
                }
            }
            if (!self.indexInitialized) {
                if(!self.homeView){M.log('error', '你必须设置ishome属性');return}
                self.homeView.box = M.Node.create('<div data-role="viewIndex"></div>')
                app.viewContainer.append(self.homeView.box);
                self.homeView.view = Mt.renderView(self.homeView.viewName, self.homeView.box, null, app);
                self.indexInitialized = true;
            }
            self[CURRENT_VIEW] = self.homeView;
            app.setTitle(self.homeView.title);
            self.clear();
            self[CURRENT_VIEW].view.$show();
            M.$Swap.isBack = false;
            return;
        }
        var tagView = false;

        //在已经渲染是视图中查找

        M.each(this[ViewLists], function(n, i) {
            if (n.hash === evt.newHash) {
                tagView = n;
                return false;
            }
        });

        if (tagView) {
            if (tagView.noBack && M.$Swap.isBack) {
                // localStorage.setItem('$isBack', '');
                tagView.view.destroy();
                // tagView.box.remove();
                M.Array.removeArray(tagView, this[ViewLists])
                self.back();
                M.$Swap.isBack = false;
                return;
            }
            // 已经找到对应的视图。如果不是后退的话或该页面设置为不保存，则调用页面的reflesh方法

            //!localStorage.getItem('$isBack') ||
            if (tagView.noHold) {
                //不需要保留视图，则删除历史记录
                //TODO 视图关闭时，如果不需要保留，则卸载之
                //M.log(tagView.noHold);
                M.Array.removeArray(tagView, this[ViewLists]);
                // tagView.box.getData('$scope').$$self.noHold = true;
                // debugger;
                // console.info(1)
                tagView.view.$hide(false, true);
                // app.hideView(tagView.box, true);
            } else {
                //要显示的视图已经渲染且被隐藏，则显示它
                var _tv = self[CURRENT_VIEW];
                self[CURRENT_VIEW] = tagView;
                if (tagView.title) {
                    app.setTitle(tagView.title);
                }
                // console.log('789');

                self[CURRENT_VIEW].view.$show(false, function() {
                    // console.info(2)
                    _tv && _tv.view.$hide(true);
                    // this[ViewLists]
                });
                // app.showView(tagView.box, false);
                //激活当前页面的viewBox
                // localStorage.setItem('$isBack', '');
                M.$Swap.isBack = false;
                // console.log('b', self[ViewLists]);
                return;
            }
        }
        self.hash = hash;
        M.each(ms, function(route) {
            var m = hash.match(route.regex),
                viewName = route.viewName,
                ks = route.keys,
                params = {},
                div = M.Node.create('<div style="display:none"></div>');
            if (!Mt.existView(viewName)) {
                M.log('error', 'afterHashChange: 找不到名为 ' + viewName + ' 的试图');
                return;
            }
            var _tv = self[CURRENT_VIEW] && self[CURRENT_VIEW].view;
            // app.hideView(self[CURRENT_VIEW]);
            M.each(m.slice(1), function(v, i) {
                params[ks[i]] = v;
            });

            params.$querystring = hashObj.params;
            params.$$evt = evt;
            // 判断是否属于不需要加入后退的路径
            // if(!nroute.oHold){
            // }
            // if (route.uninitView) {
            //     div.removeClass('render-view');
            // } else {
            //     div.removeClass('render-view');
            // }
            app.viewContainer.append(div);
            self[ViewLists].push({
                params: params,
                viewName: viewName,
                view: Mt.renderView(viewName, div, params, app),
                box: div,
                title: route.title,
                noHold: route.noHold,
                noBack: route.noBack,
                hash: evt.newHash || evt.hash
            });
            self[CURRENT_VIEW] = self[ViewLists][self[ViewLists].length - 1];
            if (route.title) {
                app.setTitle(route.title);
            }
            self[CURRENT_VIEW].view.$show(!M.$Swap.isBack && (self[ViewLists].length > 1 || self.indexInitialized), function() {
                // console.info(3)
                _tv && _tv.$hide();
            });
            M.$Swap.isBack = false;
            // console.log('c', self[ViewLists]);
        });
    };

    // self.$$this[ViewLists] = this[ViewLists];
    Mt.Router = router;
});