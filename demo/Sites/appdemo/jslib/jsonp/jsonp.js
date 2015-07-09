/**
 * jsonp类
 * @author zhangjian
 * @class jsonp
 * @date 2013.06.28
 * @constructor
 * @version 1.0.5
 */
Mo.define('jsonp', function(M) {
    var win = M.config.win,
        jsonpDequeue = {};

    var DEFAULTCONFIG = {
        autoload: true,
        _jsonpcallback: "jsonp_"
    }

    function jsonp() {
        this.init.apply(this, arguments);
    };

    M.extend(jsonp, {
        init: function(options) {
            var self = this;
            //加载默认参数
            M.stamp(self);
            self.opts = M.merge(DEFAULTCONFIG, options);
            self.opts._jsonpcallback += (self.opts.jsonpcallback || self.id);
            self.opts.url += (self.opts.url.indexOf("?") == -1 ? "?" : "&") + "callback=" + self.opts._jsonpcallback;
            if(self.opts.data)
            //绑定事件
            self._bindEvent();
            //是否自动请求
            if (self.opts.autoload) {
                self._loadData();
            }
            return self;
        },
        /**
         *@description 绑定事件
         *@method _bindEvent
         *@private
         */
        _bindEvent: function() {
            var self = this;
            if (self.opts.beforeSend) {
                self.opts.beforeSend.call(this);
            }
            //循环追加参数
            if (!M.Lang.isEmptyObject(self.opts.data)) {
                self.opts.url += '&' + M.Lang.encodeUrl(self.opts.data);
            }

            if (!self.opts.cache) {
                self.opts.url += "&_=" + (new Date).getTime();
            }
            //缓存函数
            if (!win[self.opts._jsonpcallback]) {
                win[self.opts._jsonpcallback] = function(data) {
                    self.opts.on.complete && self.opts.on.complete(data);
                    if (data.StatusCode && data.StatusCode == 200) {
                        self.opts.on.success && self.opts.on.success(data);
                    } else {
                        self.opts.on.failure && self.opts.on.failure(data);
                    }
                    win[self.opts._jsonpcallback] = null;
                };
            }
        },
        /**
         *@description 加载url
         *@method _loadData
         *@private
         */
        _loadData: function() {
            var self = this;

            self.opts.on.start && self.opts.on.start.apply(self);
            try {
                getScript(self.opts.url, function(o) {
                    //IE 不会进入error，但是会进callback，如果没有回调函数，则说明异常
                    if (win[self.opts._jsonpcallback]) {
                        self.opts.on.failure && self.opts.on.failure({
                            code: 20003,
                            msg: 'jsonp,资源加载异常',
                            data: {}
                        });
                    }
                    self.opts._scriptid = o.element.id;
                    self.destroy();
                }, function(o, err) {
                    //非IE会进入onerror事件
                    self.opts.on.failure && self.opts.on.failure({
                        code: 20004,
                        msg: 'jsonp,资源加载异常',
                        data: {
                            error: err
                        }
                    });
                    self.opts._scriptid = o.element.id;
                    self.destroy();
                });
            } catch (err) {
                self.opts.on.failure && self.opts.on.failure({
                    code: 20005,
                    msg: 'jsonp, 执行异常',
                    data: {
                        error: err
                    }
                });
            }
        },
        /**
         *@description 销毁对象
         *@method destroy
         *@private
         */
        destroy: function() {
            var self = this;
            M.one("#" + self.opts._scriptid).remove();
            //删除实例
            delete jsonpDequeue[self.id];
        }
    });
    M.jsonp = function(config) {
        var jp = new jsonp(config);;
        jsonpDequeue[jp.id] = jp;
    };

    function getScript(url, cbl, errorCbl) {
        var ele = document.createElement('script');
        ele.type = 'text/javascript';
        ele.src = url;
        ele.id = 'jsonp_' + M.guid();
        if (cbl || errorCbl) {
            if (cbl && ele.readyState) {
                //IE
                ele.onreadystatechange = function() {
                    if (ele.readyState === "loaded" || ele.readyState === "complete") {
                        ele.onreadystatechange = null;
                        cbl({
                            element: ele
                        });
                    }
                };
            } else {
                if (cbl) {
                    ele.onload = function() {
                        cbl({
                            element: ele
                        });
                    }
                };
                if (errorCbl) {
                    ele.onerror = function() {
                        errorCbl({
                            element: ele
                        });
                    }
                };

            }
        }
        document.getElementsByTagName('head')[0].appendChild(ele);
    }
});