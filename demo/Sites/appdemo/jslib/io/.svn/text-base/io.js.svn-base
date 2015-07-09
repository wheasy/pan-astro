/**
 * io-base
 * @module: io-base
 * @author: zhangjian
 * @date: 2013/6/28
 */

Mo.define('io', function(M) {
    var core = M.io.core,
        L = M.Lang,
        ioqueue = {};
    /**
     *@class IO
     *@method ajax
     *@param {config} 配置
     */
    function IO(config) {
            this.init.apply(this, arguments);
        }
        //M.extend(IO, M.EventTarget);
    M.extend(IO, {
        timeout: 30000,
        autoAbort: false,
        disableCaching: true,
        disableCachingParam: '_dc',
        init: function(options) {
            this.opts = options;
            return this;
        },
        /**
         *@description 异步请求方法
         *@method request
         *@param {o} object
         *@public
         */
        request: function(o) {
            var self = this;
            if (L.isFunction(o.start)) {
                o.start.call(self, o);
            }
            var p = o.data;

            if (L.isFunction(p)) {
                p = p.call(o.scope || M.config.win, o);
            }
            if (L.isObject(p)) {
                p = L.encodeUrl(p);
            }
            if (self.extraParams) {
                var extras = L.encodeUrl(self.extraParams);
                p = p ? (p + '&' + extras) : extras;
            }

            var url = o.url || self.url;

            if (L.isFunction(url)) {
                url = url.call(o.scope || window, o);
            }



            var hs = o.headers;
            if (self.defaultHeaders) {
                hs = M.merge(hs || {}, self.defaultHeaders);
                if (!o.headers) {
                    o.headers = hs;
                }
            }
            var cb = {
                success: self.handleResponse,
                failure: self.handleFailure,
                scope: self,
                argument: {
                    options: o
                },
                timeout: o.timeout || self.timeout
            };

            var method = o.method || self.method || ((p || o.xmlData || o.jsonData) ? "POST" : "GET");
            method = method.toUpperCase();
            if (method == 'GET' && (self.disableCaching && o.disableCaching !== false) || o.disableCaching === true) {
                var dcp = o.disableCachingParam || self.disableCachingParam;
                url += (url.indexOf('?') != -1 ? '&' : '?') + dcp + '=' + (new Date().getTime());
            }

            if (L.isBoolean(o.autoAbort)) { // options gets top priority
                if (o.autoAbort) {
                    self.on.abort();
                }
            } else if (self.autoAbort !== false) {
                self.on.abort();
            }
            if ((method == 'GET' || o.xmlData || o.jsonData) && p) {

                url += (url.indexOf('?') != -1 ? '&' : '?') + p;
                p = '';
            }
            self.transId = core.request(method, url, cb, p, o);
            return self.transId;

        },
        isLoading: function(transId) {
            return transId ? c.isCallInProgress(transId) : !!this.transId;
            /*
            if (transId) {
                return c.isCallInProgress(transId);
            } else {
                return this.transId ? true : false;
            }
            */
        },
        abort: function(transId) {
            transId = transId || this.isLoading();
            if (transId) {
                core.abort(transId);
            }
        },

        // private 请求成功调用方法
        handleResponse: function(response) {
            this.transId = false;
            var options = response.argument.options;
            response.argument = options ? options.argument : null;
            // this.fireEvent("requestcomplete", this, response, options);
            options.success && options.success.apply(options.scope, [response, options] || []);
            options.complete && options.complete.apply(options.scope, [response, true, options] || []);
            this.destroy();
        },

        // private 请求失败调用方法
        handleFailure: function(response, e) {
            this.transId = false;
            var options = response.argument.options;
            response.argument = options ? options.argument : null;
            // this.fireEvent("requestexception", this, response, options, e);
            options.failure && options.failure.apply(options.scope, [response, options] || []);
            options.complete && options.complete.apply(options.scope, [response, false, options] || []);
            this.destroy();
        },
        destroy: function() {
            var self = this;
            delete ioqueue[self.opts.__id];
        }
    });

    /**
    @description io操作
    @method io
    @static
    @param {options}
    @return {null}
     **/
    M.xio = function(options) {
        var _id = M.guid();
        ioqueue[_id] = new IO({
            autoAbort: false,
            __id: _id
        });
        return ioqueue[_id].request(options);;
    };
});