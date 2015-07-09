/**
 * 单页App方案
 * @namespace Mt
 */
Mo.define('view', function(M) {
    var moto = Mt,
        compiler = M.Compiler,
        view_cache = {},
        L = M.Lang,
        view_ins_list = {},
        isSupportAnim = L.isCool(); //是否支持动画
    var hideStartPage = function() {
        if (M.role('start-page')) {
            M.role('start-page').addClass('stare-page-hide');
            setTimeout(function() {
                M.role('start-page').remove();
            }, 500)
        }
    };
    /**
     * @class Mt.View
     */
    /** @lends Mt.View.prototype */
    var View = ({
        //事件
        /**
         * loaded 视图结构渲染完成
         * @name Mt.View#loaded
         * @event
         */
        /**
         * 重新渲染事件
         * @name Mt.View#reUpdateView
         * @event
         */
        /**
         * 视图隐藏事件
         * @name Mt.View#slient
         * @event
         */
        /**
         * 视图显示事件
         * @name Mt.View#active
         * @event
         */
        /**
         * 视图显示事件
         * @name Mt.View#afterLoaded
         * @event
         */
        /**
         * 视图销毁事件
         * @name Mt.View#destroy
         * @event
         */
        /**
         * 视图完成渲染300毫秒后执行，*视图显示动画为300毫秒，如果在视图切入过程中操作视图，会造成页面闪烁*
         * @name Mt.View#loaded_lazy
         * @event
         */
        // $dom
         //TODO 链接到xPost
        /**
         * 视图中正在进行的xpost请求队列，请求结束后会从队列中移除。视图销毁时，会自动取消队列中的所有请求
         * @type {M.xPost[]}
         */
        _$xpostlist:[],
        /**
         * 视图中所有的data-role节点
         * @type {Object}
         * @example
         * <div data-role="box"></div>
         * <button data-role="submit"></button>
         *
         * //视图加载完成之前，页面节点为空，所以视图加载完成后才能通过$dom访问节点
         * scope.$on('loaded', function(){
         *     scope.$dom['box'].hide();
         *     //绑定单击事件
         *     scope.$dom['submit'].on('click', function(){
         *         //...
         *     });
         * })
         */
        $dom:[],        
        /**
         * @property {Array<{url:"url"}>} $dataSource 数据源
         * @property {String} $dataSource.url 接口地址
         * @property {String} $dataSource.method="get" 接口形式
         * @property {Array} $dataSource.map 请求结果映射表
         * @property {Bool} $dataSource.lazy=false 是否是延迟加载
         * @property {Int} $dataSource.order=1 接口请求队列。可通过
         * @property {Function} $dataSource.fn 请求地址
         * @property {Function} $dataSource.before 请求接口前会执行该函数，如果*返回不为True，则不调用该接口*
         */
        $dataSource:[],
        /**
         * 插件配置
         * @type {Object}
         * @example <caption>HTML</caption>
         * ```
         * <div mt-plugin="form" plugin-index="login">
         * <!-- 表单内容 -->
         * ...
         * </div>
         * ```          
         * @example <caption>JS</caption>
         * scope.$pluginCfg['login'] = {
         *     data:{
         *         from:'astro'
         *     },
         *     //表单成功后的回调函数
         *     success:function(res){
         *         console.log('登陆成功')
         *     }
         *  }
         */
        $pluginCfg: {},
        /**
         * 初始化函数
         */
        $init: function() {
            var self = this,
                l = 0;
            M.extend(self, Mt.scopeBase);
            M.stamp(self, false, '$moid');
            self.$dom = {};
            self._$xpostlist = {};
            // elf._$xpostlist[M.stamp(cfg.on)] =

            self.cons(self, self.get('host'), self.get('params'), M);

            //TODO 预加载
            // var h = self.$html.match(/\<header[\s\S]*?\>[\s\S]*?\<\/header\>/ig);
            var h = self.$html.match(/\<header[\s\S]*?\>[\s\S]*?\<\/header\>/ig);

            h = (h ? h[0] : '') + $res.tpl.app.view_loading;

            var $html = self.$html;
            self.$html = h;
            self.get('host').setStyles({
                'transform': 'translateX(100%)',
                "-moz-transform": 'translateX(100%)',
                "-webkit-transform": 'translateX(100%)',
                "-ms-transform": 'translateX(100%)'
            });
            M.Compiler.render(self, self.get('host'));
            self.$html = $html;
            // return
            self.$dataSource = self.$dataSource || [];
            // var t1 = new Date
            // console.log('beforeLoaded', t1 - 0);

            self.$on('active', function(obj) {
                // var t2 = new Date;
                // console.log('laoded', t2 - 0 + ',  ' + (t2 - t1));
                var scope = obj.scope;
                scope.get('host').addClass('view-loaded');
            });
            self.$dataSource.bind = {};
            if (M.Array.filter(self.$dataSource, function(item, idx) {
                    M.each(item.map, function(m) {
                        var m = m.split(':');
                        self.$dataSource.bind[m[0]] = item;
                    });
                    return !item.lazy;
                }).length) {
                self.$loadDataSource();
            } else {
                self.$on('inited', function() {
                    self.updateView();
                });
            }
        },
        /**
         * 绑定事件
         * @param  {String} name    事件名称
         * @param  {Function} handle  事件的回调函数
         * @param  {Object} [context] This的指向
         */
        $on: function(name, handle, context) {
            var self = this;
            self.$events = self.$events || {};
            self.$events[name] = self.$events[name] || {}
            self.$events[name][M.stamp(handle)] = {
                fn: handle,
                context: context
            };
        },
        /** 
         * 清除所有的请求 <br/>在视图销毁时，会主动调用该方法
         * @inner
         */
        $clearXpost: function() {
            var self = this;
            // debugger;
            M.each(self._$xpostlist, function(p, pid) {
                // debugger;
                if (!p) {
                    return;
                }
                // console.log('cear');
                var conn = self._$xpostlist[pid] && self._$xpostlist[pid].conn;
                conn && conn.abort();
                delete self._$xpostlist[pid];
                self._$xpostlist[pid] = null;
            });
        },
        /**
         * 请求接口
         * @param  {M~xpostOption}
         * @example
         * scope.$xPost({
         *     url:'login',
         *     data:{
         *         uname: 'tick',
         *         pwd: '123456'
         *     },
         *     on:{
         *         success:function(res){
         *             //...
         *         }
         *     }
         * })
         */
        $xPost: function(cfg) {
            var self = this;
            if (!cfg) {
                return;
            }
            var fn = cfg.on && cfg.on.complete ? cfg.on.complete : null;
            cfg.on = cfg.on || {};

            cfg.on.complete = function() {
                // this is cfg.on
                fn && fn.call(this, arguments);
                // self._$xpostlist[this.id].conn.abort();
                delete self._$xpostlist[this.id];
                self._$xpostlist[this.id] = null;
            }
            var xpost = M.xPost(cfg);
            self._$xpostlist[M.stamp(cfg.on)] = xpost;
        },
        /**
         * 取消事件绑定
         * @param  {String}   name 事件名称
         * @param  {Function} fn   事件处理函数
         */
        $off: function(name, fn) {
            var self = this;
            var ets = self.$events || {};
            if (!fn) {
                ets[name] = null;
                return;
            }
            var gid = M.stamp(fn);
            ets = ets[name] || {};
            delete ets[gid];
        },
        /**
         * 触发事件
         * @param  {String} name 事件名称
         */
        $fire: function(name) {
            //M.log('$fire'+":"+name);
            var scope = this,
                es,
                args = M.Array.toArray(arguments).slice(1);
            scope.$events = scope.$events || {};
            es = scope.$events[name];

            M.each(es, function(handle) {
                handle.fn.apply(handle.context || scope, args);
            });
        },
        /** 
         * 加载DataSource，配置参考 {@link View#DataSource}
         * @private
         */
        $loadDataSource: function() {
            var self = this;
            self.$dataSource = self.$dataSource || [];
            if (self.$dataSource.length) {
                var $dataSource = [];
                M.each(self.$dataSource, function(ds, idx) {
                    var i = L.isNumber(ds.order) ? ds.order : 1;
                    $dataSource[i] = $dataSource[i] || [];
                    $dataSource[i].push(ds);
                });
                var groupCount = $dataSource.length;
                var fnEachDataGroup = function(gIndex, self) {
                    var dsGroup = $dataSource[gIndex];
                    var gLength = dsGroup && dsGroup.length;
                    if (gLength) {
                        (function(dsGroup, dsLength) {
                            M.each(dsGroup, function(api) {
                                if (api.lazy || api.before && !api.before()) {
                                    if (--dsLength === 0) {
                                        fnEachDataGroup(++gIndex, self);
                                    }
                                    return;
                                }
                                var params = {};
                                M.each(api.params, function(p, n) {
                                    params[n] = L.isFunction(p) ? p() : p;
                                });
                                self.$xPost({
                                    url: api.url,
                                    data: params,
                                    method: api.method,
                                    on: {
                                        success: function(res, cfg) {
                                            // self.$xpost = null;
                                            // if (res.MessageCode == 201) {
                                            //     cfg.on.failure(res, cfg)
                                            //     return;
                                            // }
                                            api.first = api.first ? false : true;
                                            if (api.fn) {
                                                api.fn(res);
                                            }
                                            var data = res.data;
                                            M.each(api.map, function(m) {
                                                var m = m.split(':');
                                                self[m[0]] = m[1] == '*' ? data : L.getObjValue(data, m[1] || m[0]);
                                            });
                                            if (--dsLength === 0) {
                                                fnEachDataGroup(++gIndex, self);
                                                // self.updateView();
                                            }
                                        },
                                        failure: function(res) {
                                            // self.$xpost = null;
                                            api.first = api.first ? false : true;
                                            if (api.failure) {
                                                api.failure();
                                                if (--dsLength === 0) {
                                                    fnEachDataGroup(++gIndex, self);
                                                    // self.updateView();
                                                }
                                            } else {
                                                if (M.Lang.isUndefined(res.MessageCode)) {
                                                    Mt.alert(res.Message);
                                                }
                                                // self.set('needReload', true);
                                                // localStorage.loginRefer = self.get('app').router.hash;
                                                // // history.replaceState(null, "页面标题", "xxx.html");
                                                // setTimeout(function() {
                                                //     M.$Swap.noLoginAnimation = true;
                                                //     self.get('app').router.redirect('/user/login');
                                                // }, 350);
                                                // return;
                                                // }

                                                // 未登录
                                                // alert('there is a (ajax)error in view:' + api.url, res);
                                                // setTimeout(function() {
                                                self.$on('active', function() {
                                                    Mt.alert(res.Message, {
                                                        ok: function() {
                                                            self.get('app').router.back();
                                                        }
                                                    });
                                                });
                                                // }, 20);
                                            }
                                        }
                                    }
                                });
                            });
                        }(dsGroup, dsGroup.length));
                    } else {
                        if (gIndex >= groupCount) {
                            // if (self.get('isFirst') == false) {
                            //     self.updateView();
                            // } else {
                            //     self.$on('ready', function() {
                            setTimeout(function() {
                                // code
                                self.updateView();
                            }, 1000);
                            //     });
                            // }
                        } else {
                            fnEachDataGroup(++gIndex, self);
                        }
                    }
                }
                fnEachDataGroup(0, self);
            }
        },
        /**
         * 更新视图
         * @param  {Boolean} isForce=false 是否是手动渲染，当为true时，会触发{@link Mt.View.event:reUpdateView}事件
         * @fires Mt.View#reUpdateView
         */
        updateView: function(isForce) {
            var self = this,
                host = self.get('host');
            //视图已渲染，且不是手动渲染
            if (self.$$status && !isForce) {
                return;
            }
            // self.$off('loaded');
            // self.$off('loaded_lazy');
            // self.$off('afterLoaded');
            if (isForce) {
                self.$fire('reUpdateView');
            }
            compiler.render(self, host, false, 'v_' + self.$viewName);
            // #tag scope.$dom
            // 把data-role的节点半丁到scopr.$dom上
            host.all('[data-role]').each(function() {
                self.$dom[this.getAttr('data-role')] = this;
            });

            // var tb = new Date - 0;
            // console.info('AfterRenderView' + tb + '  ' + (tb - ta)/1000);
            // setTimeout(function(){
            // alert('AfterRenderView' + tb + '  ' + (tb - ta)/1000);
            // }, 2000)
            // setTimeout(function(){
            self.$fire('loaded', {
                scope: self,
                isForce: isForce
            });
            if (self.$events['loaded_lazy']) {
                //延迟 300 毫秒 触发loaded_lazy, 可通过该事件错开CPU占用高峰
                setTimeout(function() {
                    self.$fire('loaded_lazy', {
                        isForce: isForce
                    });
                }, 400);
            }
            self.$fire('afterLoaded', {
                isForce: isForce
            });

            self.$$status = 'rendered';
            // }, 10)
        },
        /**
         * 销毁视图
         */
        destroy: function() {
            var self = this;
            self.$clearXpost();
            self.$fire('destroy');
            self.get('host').remove();
            delete view_ins_list[self.$roid];
        },
        /**
         * 隐藏视图
         * @param  {Boolean} [isAnimation=false] 是否有动画
         * @param  {Boolean} [isDestroy=false]   隐藏后是否销毁
         * @param  {Function}  [cbl]         隐藏后的回调函数
         * @fires Mt.View#slient slient
         */
        $hide: function(isAnimation, isDestroy, cbl) {
            isAnimation = !!isAnimation && isSupportAnim;
            // console.log('$hide2: isAnimation', isAnimation);
            //激活hide事件
            var self = this,
                app = this.app,
                host = self.get('host');

            if (L.isFunction(self.$showCbl)) {
                self.$showCbl();
                self.$showCbl = null;
            }
            if (self.get('status') === 'slient') {
                isDestroy && self.destroy();
                return;
            }
            moto.hideConfirm();
            // self.hideCbl = cbl;
            // 正在做显示动画, 则取消动画, 并隐藏
            if (self.$timer_show) {
                clearTimeout(self.$timer_show);
                self.$timer_show = null;
            }
            // if (animation) {
            host.setData('$scrollTop', document.body.scrollTop);
            if (isAnimation) {
                //隐藏之前, 删除 view-loadedClass, 以便取消当前视图中的positon:fixed
                host.removeClass('view-loaded,mt-view-in');
                host.addClass('mt-view-out');

                self.set('status', 'slient');
                self.$timer_hide = setTimeout(function() {
                    host.setStyle('zIndex', 1);
                    self.$fire('slient', {
                        scope: self
                    });
                    host.hide();
                    host.removeClass('mt-view-in,mt-view-out');
                    cbl && cbl();
                    isDestroy && self.destroy();
                }, 300);
            } else {
                host.setStyle('zIndex', 1);
                host.hide();
                self.set('status', 'slient');
                host.setStyles({
                    'transform': 'translateX(100%)',
                    "-moz-transform": 'translateX(100%)',
                    "-webkit-transform": 'translateX(100%)',
                    "-ms-transform": 'translateX(100%)'
                });
                host.removeClass('mt-view-in,mt-view-out');
                // host.setStyle('left', '103%');
                self.$fire('slient', {
                    scope: self
                });
                cbl && cbl();
                isDestroy && self.destroy();
            }
        },
        /**
         * 显示视图
         * @param {Boolean} [isAnimation=false] 视图显示是否有动画效果，该参数尽在iPhone下有效
         * @param {Function} cbl
         * @fires Mt.View#active
         */
        $show: function(isAnimation, cbl) {
            // console.log('show:' + this.$viewName);
            // console.log('$show1: isAnimation', isAnimation);
            isAnimation = !!isAnimation && isSupportAnim && !M.$Swap.noLoginAnimation;
            // console.log('isAnimation', isAnimation);
            // console.log('$show2: isAnimation', isAnimation);
            M.$Swap.noLoginAnimation = false;
            var self = this,
                app = self.app,
                host = self.get('host');
            if (self.get('status') === 'active') {
                return;
            }
            self.$showCbl = cbl;

            if (self.$timer_hide) {
                clearTimeout(self.$timer_hide);
                self.$timer_hide = null;
            }
            host.setStyle('zIndex', 50);
            host.show();
            // alert(1);
            // window.sss = window.sss?window.sss:0;
            // alert(sss);
            // if(++sss == 2){return;}
            if (!isAnimation) {
                host.setStyle('width', '100.1%');
            }
            //隐藏启动页面
            setTimeout(function() {
                if (hideStartPage) {
                    hideStartPage();
                    hideStartPage = false;
                }
            }, 1000)

            // return;

            self.$timer_show = setTimeout(function() {
                // alert('isAnimation'+isAnimation);
                // console.log('isAnimation');
                if (isAnimation) {
                    // var t3 = new Date;
                    // console.log('beforeShow', t3 - 0 + ', left:' + host.getStyle('left'));
                    // host.addClass('mt-view-base');
                    // host.setStyle('left', '0');
                    host.addClass('mt-view-in');
                    self.set('status', 'active');
                    self.$timer_show = setTimeout(function() {
                        // return
                        // var t4 = new Date;
                        // console.log('afterShow', t4 - 0 + ',  ' + (t4 - t3));
                        host.setStyle('zIndex', 20);
                        cbl && cbl();
                        self.$showCbl = null;
                        self.$timer_show = setTimeout(function() {
                            document.body.scrollTop = host.getData('$scrollTop') || 0;
                        }, 20);
                        if (self.get('isFirst') != false) {
                            // 在动画加载完成以后, 加载数据或渲染页面
                            // self.$fire('ready');
                            self.$fire('inited');
                        }
                        self.set('isFirst', false);
                        // 需要重新load页面
                        if (self.get('needReload')) {
                            // console.log('needReload');
                            self.set('needReload', false);
                            self.$loadDataSource();
                        }
                        host.setStyles({
                            'transform': null,
                            "-moz-transform": null,
                            "-webkit-transform": null,
                            "-ms-transform": null
                        });
                        host.removeClass('mt-view-in');
                        self.$fire('active', {
                            scope: self
                        });
                    }, 400);

                } else {
                    // host.addClass('mt-view-in');
                    host.setStyles({
                        'transform': null,
                        "-moz-transform": null,
                        "-webkit-transform": null,
                        "-ms-transform": null
                    });
                    cbl && cbl();
                    self.$showCbl = null;
                    host.setStyle('zIndex', 20);
                    self.set('status', 'active');
                    if (self.get('isFirst') != false) {
                        // 在动画加载完成以后, 加载数据或渲染页面
                        // self.$fire('ready');
                        self.$fire('inited');
                    }
                    self.set('isFirst', false);
                    document.body.scrollTop = host.getData('$scrollTop') || 0;
                    host.setStyle('width', '100%');
                    if (self.get('isFirst') != false) {
                        setTimeout(function() {
                            self.$fire('ready');
                        }, 50);
                    }
                    self.set('isFirst', false);
                    // 需要重新load页面
                    if (self.get('needReload')) {
                        self.set('needReload', false);
                        self.$loadDataSource();
                    }
                    self.$fire('active', {
                        scope: self
                    });
                }
            }, 10);
        },
        /**
         * 显示遮罩
         */
        $mask: function() {
            //TODO 在视图内部展示
            M.mask();
        },
        /**
         * 显示确定“确定”，“取消”选择框
         * @param  {String} message  提示内容
         * @param  {Object} callBack
         * @param  {Function} callBack.ok 点击“确定”时的回调函数
         * @param  {Function} callBack.calcel 点击“取消”时的回调函数
         */
        $confirm: function(message, callBack) {
            Mt.confirm(message, {
                ok: function() {
                    if (callBack && callBack.ok) {
                        callBack.ok();
                    };
                },
                cancel: function() {
                    if (callBack && callBack.cancel) {
                        callBack.cancel();
                    };
                }
            });
        },
        /**
         * 显示警告对话框
         * @param  {String} message  提示内容
         * @param  {Function} success 点击“确定”时的回调函数
         */
        $alert: function(message, success) {
            Mt.alert(message, {
                ok: function() {
                    if (success) {
                        success();
                    };
                }
            });
        }
    });
    
    M.extend(moto, /** @lends Mt */{
        /**
         * 渲染视图
         * @memberOf Mt
         * @param  {String} v      视图名称
         * @param  {Node} ele    容器
         * @param  {Object} params 请求视图的参数
         * @param  {App} app    App实例
         * @return {View}     视图实例
         */
        renderView : function(v, ele, params, app) {
            var v = moto.createView(v);
            if (!v) {
                return;
            }
            ele.addClass('mt-view');
            ele.addClass('view-' + v.$viewName);
            v.set('params', params);
            v.set('host', ele);
            v.set('app', app);

            moto.getTpl('v', v.$viewName, function(tpl) {
                //获取视图
                // M.Template.get(self.$viewName, function(tpl) {
                /*
                if(!self.complier){
                    elf.$tpl2 = compiler.precompile(tpl);
                    self.complier = M.Template(tpl.replace(/(<\w+.*?)(\smt[a-z,-]\w+.*?>)/ig, '$1 mt$2'));
                }
                */
                if (!tpl) {
                    console.log('error', '未找到试图对应的TPL，请检查定义的视图名称(Moto.defineView)和文件名称是否一致');
                }
                v.$html = tpl;
                v.$init();
            });
            var stamp = M.stamp(v, '$roid')
            view_ins_list[stamp] = v;
            return v;
        },
        /**
         * 获得视图
         * @param  {string} viewName 视图名称
         * @param  {bool} [instantiation=true]  是否需要实例化
         * @return {View}   视图或者视图的实例
         */
        createView: function(viewName, instantiation) {
            var v = view_cache[viewName];
            if (!v) {
                M.log('error', 'moto : 找不到名为 ' + viewName + ' 的视图');
                return false;
            }
            if (instantiation != false) {
                v = new v;
                v.$viewName = viewName;
                return v;
            }
            return v;
        },
        /**
         * 判断是否有对应名称的视图
         * @param  {string}  viewName 视图名称
         * @return {bool}   存在则返回true
         */
        existView: function(viewName) {
            return !L.isUndefined(view_cache[viewName])
        },

        /**
         * 定义视图，和通过Mt.createView(viewName)获取
         * @param  {String} name       视图名称
         * @param  {defineViewCbl} construction 初始化函数
         * @param  {Object} [cfg]        属性
         */
        defineView: function(name, constrator, cfg) {
                var v = function() {
                    // debugger;
                    v.superclass.constructor.apply(this, arguments);
                    this.initDataByAttrs.apply(this);
                };
                if (view_cache[name]) {
                    console.log('warn', '名为的视图 ' + name + ' 已存在');
                }
                v.ATTRS = cfg || {};
                M.extend(v, M.Base);
                M.extend(v, View);
                M.extend(v, {
                    cons: constrator
                });
                view_cache[name] = v;
            }
    });
    /**
     * 视图的初始化函数
     * @callback defineViewCbl
     * @param {View}    scope   视图本身
     * @param {Node}    ele     视图所在的容器
     * @param {Object}  params  路由上的参数
     * @param {Object} params.$querystring 问号形式传递的参数
     * @example
     * //路由为 "detail/:aid"
     * //app.html#/detail/100?page=1
     * Mt.defineView('detail', function(scope, ele, params) {
     *    //params.querystring为问号传参数
     *    console.log('aid：', params.aid);
     *    console.log('page：', params.$querystring.page);
     *    scope.$on('loaded', function(){
     *        //console.log('视图加载完成');
     *    })
     * });
     * //conosle 结果
     * //aid：100
     * //page：1
     */
});