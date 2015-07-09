Mo.define('scrollBox', function(M) {
    var $viewbox = {
        inited: false,
        list: {},
        detect: function() {
            // debugger;
            if ($viewbox.current && !$viewbox.current.get('manual') && $viewbox.current.triggerDom && $viewbox.current.triggerDom.getStyle('display') !== 'none') {
                var sctop = document.body.scrollTop,
                    ele = $viewbox.current.get('host'),
                    scope = $viewbox.current.get('scope'),
                    scHeight = $viewbox.current.triggerDom.get('region').top;

                //if(sctop > scHeight - document.documentElement.clientHeight) lazyHandle('bottom');
                if (sctop + 50 > scHeight - document.documentElement.clientHeight) {
                    $viewBox.eachBox.$updateView();
                };

            }
        }
    };
    /**
     * @class M.Plugin.ScrollBox
     * @example
     * ```
     * <div mt-plugin="scrollBox" plugin-index="prtList" sbox-manual="true" sbox-role="productList" class="groupon-lst">
     *     <section mt-each="groponList" data-role="productList" empty-text="暂无特卖，敬请期待" >
     *         
     *     </section>
     * </div>
     * ```
     */
    M.plugin('scrollBox', /** @lends M.Plugin.ScrollBox.prototype */{
        attrs: {
            // bodyHeight: M.one(document).get('region').height
        },
        events: {},
        init: function(cfg) {
            var self = this;
            var ele = self.get('host');
            var scope = self.get('scope');
            if (!$viewbox.inited) {
                $viewbox.inited = true;
                M.one(window).on('scroll', function() {
                    // debugger;
                    $viewbox.detect();
                });
            }

            self.set('manual', ele.getAttr('sbox-manual') == 'true')
            $viewbox.list[M.stamp(this)] = this;
            self.loaded_handle = function(obj) {
                self.eachBox = ele.role(ele.getAttr('sbox-role'));
                if (ele.getAttr('plugin-disabled') === 'true') {
                    return;
                }
                if (ele.getStyle('display') !== 'none') {
                    scope.$$currentScrollBox = self;
                }
                self.triggerDom = M.Node.create(M.Template.get('app.scrollBox_loading')({
                    isManual: self.get('manual')
                }));
                ele.append(self.triggerDom);
                if (self.get('manual')) {
                    var eachBoxDetect = function(obj, res, dom, dlength) {
                        var api = obj[0];
                        dom = obj[2];
                        dlength = obj[3];
                        //scrollBox添加psize参数 , 当请求数据小于该参数时, 隐藏加载按钮
                        //如果数据大于等于20, 则显示, 否则隐藏手动按钮
                        ele.role('sbox-loading') && ele.role('sbox-loading').hide();
                        ele.role('sbox-manual').hide();
                        if (dlength >= (self.get('psize') || 14)) {
                            if (dom.get('childNodes').size) {
                                ele.role('sbox-manual').show();
                            }
                        }
                    };
                    self.eachBox.on('$viewupdated', eachBoxDetect);
                    var d = M.Lang.getObjValue(scope, self.eachBox.getAttr('mt-each'));
                    eachBoxDetect([
                        self.eachBox.getData('api'),
                        null, self.eachBox,
                        d ? d.length : 0
                    ]);

                    self.triggerDom.role('sbox-manual').on('click', function(evt) {
                        var that = this;
                        if (that.ancestor().role('sbox-loading').getStyle('display') == 'block') {
                            return;
                        }
                        // debugger;
                        that.hide();
                        that.ancestor().role('sbox-loading').show();
                        self.eachBox.$updateView(scope);
                    });
                }
                if (self.triggerDom.get('region').top !== 0) {
                    $viewbox.current = self;
                }
            }
            self.re_handle = function() {
                self.destroy();
            }
            scope.$on('reUpdateView', self.re_handle);

            scope.$on('loaded', self.loaded_handle);

            self.active = function() {
                    $viewbox.current = this;
                    // if (this.triggerDom) {
                    // this.triggerDom.show();
                    // debugger;
                    $viewbox.detect();
                    this.get('scope').$$currentScrollBox = this;
                    // }
                };
                // view激活时, 激活当前可见的scrollBox
            self.active_handle = function(argument) {
                //可见, 则激活
                // debugger;
                if (this.get('host').getStyle('display') !== 'none') {
                    this.active();
                }
            };
            scope.$on('active', self.active_handle, self);

            self.slient_handle = function() {
                if ($viewbox.current == this) {
                    $viewbox.current == null;
                }
                // if (this.triggerDom) this.triggerDom.hide();
            };
            scope.$on('slient', self.slient_handle, self);
        },
        /**
         * 手抖触发条件判断
         * @example
         * scope.$plugs['prtList'].refresh();
         */
        refresh: function(len) {
            // debugger;
            $viewbox.detect();
        },
        /**
         * 销毁插件
         */
        destroy: function() {
            var self = this;
            var scope = self.get('scope')
            if (self.triggerDom) {
                self.triggerDom.remove();
                self.triggerDom = null;
            }
            scope.$off('active', self.active_handle);
            scope.$off('loaded', self.loaded_handle);
            scope.$off('reUpdateView', self.re_handle);

            delete self.get('host')['moto-scrollBox'];
            // self.get('host').removeClass('viewBox');
            self.get('host').setAttr('plugin-disabled', true);
            self.get('host')['moto-scrollBox'] = null;
            if ($viewbox.current == self) {
                delete $viewbox.current
                $viewbox.current = null;
            }
            delete $viewbox.list[self.id];
        }
    });
});