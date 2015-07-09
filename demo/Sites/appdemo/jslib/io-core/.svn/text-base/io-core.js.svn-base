/**
 * io-base
 * @module: io-core
 * @author: zhangjian
 * @date: 2013/6/28
 */

Mo.define('io-core', function (M) {
       M.namespace("io.core");
    /**
     *@description io.core方法
     */
    M.extend(M.io.core,{
        request : function (method, uri, cb, data, options) {
            if (options) {
                var hs = options.headers;
                if (hs) {
                    for (var h in hs) {
                        if (hs.hasOwnProperty(h)) {
                            this.initHeader(h, hs[h], false);
                        }
                    }
                }
                if (options.xmlData) {
                    if (!hs || !hs['Content-Type']) {
                        this.initHeader('Content-Type', 'text/xml', false);
                    }
                    method = (method ? method : (options.method ? options.method : 'POST'));
                    data = options.xmlData;
                } else if (options.jsonData) {
                    if (!hs || !hs['Content-Type']) {
                        this.initHeader('Content-Type', 'application/json', false);
                    }
                    method = (method ? method : (options.method ? options.method : 'POST'));
                    data = typeof options.jsonData == 'object' ? JSON.stringify(options.jsonData) : options.jsonData;
                }
            }
            return this.asyncRequest(method, uri, cb, data);
        },
        headers : {},
        hasHeaders : false,
        useDefaultHeader : true,
        defaultPostHeader : 'application/x-www-form-urlencoded; charset=UTF-8',
        useDefaultXhrHeader : true,
        defaultXhrHeader : 'XMLHttpRequest',
        hasDefaultHeaders : true,
        defaultHeaders : {},
        poll : {},
        timeout : {},
        pollInterval : 50,
        transactionId : 0,
        setProgId : function (id) {
            this.activeX.unshift(id);
        },
        setDefaultPostHeader : function (b) {
            this.useDefaultHeader = b;
        },
        setDefaultXhrHeader : function (b) {
            this.useDefaultXhrHeader = b;
        },
        setPollingInterval : function (i) {
            if (typeof i == 'number' && isFinite(i)) {
                this.pollInterval = i;
            }
        },
        createXhrObject : function (transactionId) {
            var obj;
            try {
                obj = {
                    conn : new XMLHttpRequest(),
                    tId : transactionId
                };
            } catch (e) {
                for (var i = 0; i < this.activeX.length; ++i) {
                    try {
                        obj = {
                            conn : new ActiveXObject(this.activeX[i]),
                            tId : transactionId
                        };
                        break;
                    } catch (e) {}
                }
            }
            finally {
                return obj;
            }
        },
        getConnectionObject : function () {
            var o,
                self = this,
                tId = this.transactionId;

            try {
                o = self.createXhrObject(tId);
                if (o) {
                    self.transactionId++;
                }
            } catch (e) {
                M.log('error', 'io-core:getConnectionObject' , e);;
            }
            finally {
                return o;
            }
        },
        asyncRequest : function (method, uri, callback, postData) {
            var self = this,
                o = this.getConnectionObject();

            if (!o) {
                return null;
            }
            o.conn.open(method, uri, true);

            if (self.useDefaultXhrHeader) {
                if (!self.defaultHeaders['X-Requested-With']) {
                    self.initHeader('X-Requested-With', self.defaultXhrHeader, true);
                }
            }

            if (postData && self.useDefaultHeader && (!self.hasHeaders || !self.headers['Content-Type'])) {
                self.initHeader('Content-Type', self.defaultPostHeader);
            }

            if (self.hasDefaultHeaders || self.hasHeaders) {
                self.setHeader(o);
            }

            self.handleReadyState(o, callback);
            o.conn.send(postData || null);

            return o;
        },
        handleReadyState : function (o, callback) {
            var oConn = this;

            if (callback && callback.timeout) {
                this.timeout[o.tId] = window.setTimeout(function () {
                        oConn.abort(o, callback, true);
                    }, callback.timeout);
            }

            this.poll[o.tId] = window.setInterval(
                    function () {
                    if (o.conn && o.conn.readyState == 4) {
                        window.clearInterval(oConn.poll[o.tId]);
                        delete oConn.poll[o.tId];

                        if (callback && callback.timeout) {
                            window.clearTimeout(oConn.timeout[o.tId]);
                            delete oConn.timeout[o.tId];
                        }

                        oConn.handleTransactionResponse(o, callback);
                    }
                }, this.pollInterval);
        },
        handleTransactionResponse : function (o, callback, isAbort) {
            if (!callback) {
                this.releaseObject(o);
                return;
            }

            var httpStatus,
            responseObject;

            try {
                if (o.conn.status !== undefined && o.conn.status != 0) {
                    httpStatus = o.conn.status;
                } else {
                    httpStatus = 13030;
                }
            } catch (e) {

                httpStatus = 13030;
            }

            if ((httpStatus >= 200 && httpStatus < 300) || (M.UA.ie && httpStatus == 1223)) {
                responseObject = this.createResponseObject(o, callback.argument);
                if (callback.success) {
                    if (!callback.scope) {
                        callback.success(responseObject);
                    } else {

                        callback.success.apply(callback.scope, [responseObject]);
                    }
                }
            } else {
                switch (httpStatus) {

                case 12002:
                case 12029:
                case 12030:
                case 12031:
                case 12152:
                case 13030:
                    responseObject = this.createExceptionObject(o.tId, callback.argument, (isAbort ? isAbort : false));
                    if (callback.failure) {
                        if (!callback.scope) {
                            callback.failure(responseObject);
                        } else {
                            callback.failure.apply(callback.scope, [responseObject]);
                        }
                    }
                    break;
                default:
                    responseObject = this.createResponseObject(o, callback.argument);
                    if (callback.failure) {
                        if (!callback.scope) {
                            callback.failure(responseObject);
                        } else {
                            callback.failure.apply(callback.scope, [responseObject]);
                        }
                    }
                }
            }

            this.releaseObject(o);
            responseObject = null;
        },
        createResponseObject : function (o, callbackArg) {
            var obj = {};
            var headerObj = {};
            try {
                var headerStr = o.conn.getAllResponseHeaders();
                var header = headerStr.split('\n');
                for (var i = 0; i < header.length; i++) {
                    var delimitPos = header[i].indexOf(':');
                    if (delimitPos != -1) {
                        headerObj[header[i].substring(0, delimitPos)] = header[i].substring(delimitPos + 2);
                    }
                }
            } catch (e) {}

            obj.tId = o.tId;
            obj.status = o.conn.status;
            obj.statusText = o.conn.statusText;
            obj.getResponseHeader = function (header) {
                return headerObj[header];
            };
            obj.getAllResponseHeaders = function () {
                return headerStr
            };
            obj.responseText = o.conn.responseText;
            obj.responseXML = o.conn.responseXML;

            if (typeof callbackArg !== undefined) {
                obj.argument = callbackArg;
            }

            return obj;
        },
        createExceptionObject : function (tId, callbackArg, isAbort) {
            var COMM_CODE = 0;
            var COMM_ERROR = 'communication failure';
            var ABORT_CODE = -1;
            var ABORT_ERROR = 'transaction aborted';

            var obj = {};

            obj.tId = tId;
            if (isAbort) {
                obj.status = ABORT_CODE;
                obj.statusText = ABORT_ERROR;
            } else {
                obj.status = COMM_CODE;
                obj.statusText = COMM_ERROR;
            }

            if (callbackArg) {
                obj.argument = callbackArg;
            }

            return obj;
        },
        initHeader : function (label, value, isDefault) {
            var headerObj = (isDefault) ? this.defaultHeaders : this.headers;

            if (headerObj[label] === undefined) {
                headerObj[label] = value;
            } else {

                headerObj[label] = value + "," + headerObj[label];
            }

            if (isDefault) {
                this.hasDefaultHeaders = true;
            } else {
                this.hasHeaders = true;
            }
        },
        setHeader : function (o) {
            if (this.hasDefaultHeaders) {
                for (var prop in this.defaultHeaders) {
                    if (this.defaultHeaders.hasOwnProperty(prop)) {
                        o.conn.setRequestHeader(prop, this.defaultHeaders[prop]);
                    }
                }
            }

            if (this.hasHeaders) {
                for (var prop in this.headers) {
                    if (this.headers.hasOwnProperty(prop)) {
                        o.conn.setRequestHeader(prop, this.headers[prop]);
                    }
                }
                this.headers = {};
                this.hasHeaders = false;
            }
        },
        resetDefaultHeaders : function () {
            delete this.defaultHeaders;
            this.defaultHeaders = {};
            this.hasDefaultHeaders = false;
        },
        abort : function (o, callback, isTimeout) {
            if (this.isCallInProgress(o)) {
                o.conn.abort();
                window.clearInterval(this.poll[o.tId]);
                delete this.poll[o.tId];
                if (isTimeout) {
                    delete this.timeout[o.tId];
                }

                this.handleTransactionResponse(o, callback, true);

                return true;
            } else {
                return false;
            }
        },
        isCallInProgress : function (o) {

            if (o.conn) {
                return o.conn.readyState != 4 && o.conn.readyState != 0;
            } else {

                return false;
            }
        },
        releaseObject : function (o) {
            o.conn = null;
            o = null;
        },
        activeX : [
            'MSXML2.XMLHTTP.3.0',
            'MSXML2.XMLHTTP',
            'Microsoft.XMLHTTP'
        ]
    });

});
