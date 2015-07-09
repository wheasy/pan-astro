/*
    喜欢
*/
Mo.define('lazyloader', function(M) {
    var L = M.Lang;

    M.plugin('lazyloader', {
        ATTRS: {
            //触发加载行为的临界线
            line: {
                value: '-100'
            },
            status: {
                value: 'success'
            },
            //loader触发后，延迟多久加载（自动加载时有效）
            delay: {
                value: 0
            },
            //自动加载或点击触发加载
            trigger: {
                value: 'auto' //auto|click
            },
            //
            keyRole: {
                value: 'data-fid'
            },
            //动态加载节点插入点
            insertPoint: {
                value: 'last'
            },
            //附带参数
            params: {},
            lastItem: {
                getter: function() {
                    var self = this;
                    var lastitems = self.get('host').all('[' + self.get('keyRole') + ']');
                    return lastitems.item(lastitems.size() - 1) || null;
                }
            },
            lastId: {
                getter: function() {
                    var last = this.get('lastItem');
                    if (last) {
                        return last.getAttr(this.get('keyRole')) || '';
                    }
                    return '';
                },
                setter: function(val) {
                    this.data['lastId'] = val;
                }
            }
        },
        init: function() {
            var self = this,
                host = self.get('host');

            if (!M.Lang.isObject(self.get('loader'))) {
                self.set('loader', M.one(self.get('loader')));
            }

            L.verify(self.get('loader'), 'false', 'feedloader-->loader is null', function() {
                self.bindEvent();
            });
        },
        _loadData: function() {
            //取最后一个节点，或者在loader前插入
            var self = this,
                params = null,
                lastId = null;
            if (self.get('status') == 'loading') {
                return;
            }
            self.set('status', 'loading');
            self.set('startTime', new Date());

            self.fire('beforeLoad', self);

            lastId = self.get('lastId');
            
            params = self.get('params') || {};

            params = L.exeObjValue(params, self);

            if(self.get('lastId')){
                params[self.get('keyName') || lastId] = lastId;
            }
            M.xPost({
                url: self.get('io'),
                method: 'get',
                data: M.merge(self.get('params'), params),
                on: {
                    failure: function(res) {
                        self._loadFailure(res);
                    },
                    success: function(res) {
                        if (res.code != 10000) {
                            self._loadFailure(res);
                            return;
                        }
                        //如果从开始到结束的时间短于设置delay的时间，则延迟执行回调
                        var timeSpan = new Date() - self.get('startTime');
                        if (timeSpan < self.get('delay')) {
                            M.later(self.get('delay') - timeSpan, null, function() {
                                self._loadSuccess(res.data);
                            });
                        } else {
                            self._loadSuccess(res.data);
                        }
                    }
                }
            });

        },
        // 加载失败
        _loadFailure: function() {
            var self = this;
            self.set('status', 'complete');
            self.get('loader').hide();
            self.fire('afterLoad', self);
        },
        // 加载成功
        _loadSuccess: function(data) {
            var self = this;
            // 绑定事件
            var tempdiv = M.Node.create('<div>');
            tempdiv.setHTML(data.html);
            if(!data.html){
                self.get('loader').hide();
            }
            var items = tempdiv.all('[' + self.get('keyRole') + ']');
            
            if(self.get('process')){
                items.each(function(){
                    self.get('process')(this);
                })
            }
            M.inScreen.watch(items);
            if (self.get('insertPoint') == 'last') {
                var lastitem = self.get('lastItem');
                L.isNull(lastitem, function() {
                    self.get('host').insert(tempdiv.get('children'), 0);
                }, function() {
                    lastitem.insertAfter(tempdiv.get('children'));
                });
            } else {
                self.get('loader').insertBefore(tempdiv.get('children'));
            }
            self.set('status', 'complete');
            self.fire('afterLoad', self);
        },
        //截取120个字
        // 绑定相关事件
        bindEvent: function() {
            var self = this,
                loader = self.get('loader');
            if (self.get('trigger') == 'auto') {
                M.inScreen.watch({
                    target: loader,
                    container:self.get('container'),
                    line: self.get('line'),
                    fn: function() {
                        self._loadData();
                    }
                });
                //自动加载
            } else {
                loader.on('click', function() {
                    // 加载
                    self._loadData();
                });
            }
        }
    });

});