/**
 * 扩展对象
 * @memberOf M
 * @class Object
 */
/**
 * 常用方法封装
 * @memberOf M
 * @namespace Lang
 */
/**
 * 常用方法封装
 * @memberOf M.Lang
 * @namespace Escape
 */
Mo.define('lang', function(M) {

    M.namespace('Array');
    M.namespace('Object');

    (function() {
        try {
            localStorage.test = 1;
        } catch (error) {
            window.localStorage = {};
        }
        //
    }());


    var getType = M.getType,
        ARRAY = 'array',
        BOOLEAN = 'boolean',
        DATE = 'date',
        ERROR = 'error',
        ELEMENT = 'element',
        FUNCTION = 'function',
        NODETYPE = 'nodeType',
        NUMBER = 'number',
        NULL = 'null',
        OBJECT = 'object',
        REGEX = 'regexp',
        STRING = 'string',
        UNDEFINED = undefined,
        TOSTRING = Object.prototype.toString,
        HASOWN = Object.prototype.hasOwnProperty,
        TRIMREGEX = /^\s+|\s+$/g,

        isError = {
            'false': function(d) {
                return !d
            }
        },
         /**
          * 验证一个变量是否存在
          * @param  {anything}  bol 要验证的变量
          * @param  {Function}  s   验证为true时的回调函数
          * @param  {Function}  f   验证为false时的回调函数
          * @return {Boolean}     返回验证的变量
          */
        isType = function(bol, s, f) {
            if (bol) {
                if (s) {
                    s();
                }
            } else {
                if (f) {
                    f();
                }
            }
            return bol;
        },
        _templayer;
    /**
     * @lends M.Lang
     */
    M.Lang = {
        /**
         * 模板缓存层
         * @param  {String} n 模板
         */
        templayer: function(n) {
            _templayer = M.one('#mo_temporal_layer');
            if (!_templayer) {
                _templayer = M.Node.create('<div id="mo_temporal_layer"></div>')
                M.one('body').append(_templayer);
            }
            M.Lang.templayer = function(n1) {
                _templayer.append(n1);
            }
            M.Lang.templayer(n);
        },
        /**
         * 去除字符串两端的空白
         * @param {String} str 文本
         * @return {String}
         **/
        trim: function(s){
            if(String.prototype.trim){
                return (s && s.trim) ? s.trim() : s;
            }else{
                try {
                    return s.replace(TRIMREGEX, '');
                } catch (e) {
                    return s;
                }
            }

        },
        /**
         * 克隆
         * @param  {Anthing} o      克隆源对象
         * @param  {Boolean} [safe]   是否启用安全模式
         * @param  {Function} [fn]      检测被克隆对象上的属性需要满足的函数
         * @param  {Objecr} [c]      fn函数运行的环境
         * @return {Anthing}        克隆对象
         */
        clone: function(o, safe, fn, c) {
            var o2, stamp;

            if (!L.isObject(o) || M.instanceOf(o, Mo) || (o.addEventListener || o.attachEvent)) {
                return o;
            }
            switch (getType(o)) {
                case 'date':
                    return new Date(o);
                case 'regexp':
                    // if we do this we need to set the flags too
                    // return new RegExp(o.source);
                    return o;
                case 'function':
                    // o2 = Y.bind(o, owner);
                    // break;
                    return o;
                case 'array':
                    o2 = [];
                    break;
                default:
                    o2 = {};
            }

            M.each(o, function(v, k) {
                if ((k || k === 0) && (!fn || (fn.call(c || this, v, k, this, o) !== false))) {
                    //if (k !== CLONE_MARKER) {
                    if (k == 'prototype') {
                        // skip the prototype
                        // } else if (o[k] === o) {
                        //     this[k] = this;
                    } else {
                        this[k] = L.clone(v, safe, fn, c);
                    }
                    //}
                }
            }, o2);

            return o2;
        },
         /**
          * 验证传入的值是否是为真
          * @param  {String}   data 需要验证的数据
          * @param  {Function | String} fn   自定义验证函数|或指定函数，可用默认方法false
          * @param  {String}   msg  错误时提示消息
          * @param  {Function}   cbl  通过验证时运行的方法
          * @return {Boolean}        判断结果
          */
        verify: function(data, fn, msg, cbl) {
            //
            //verify(data,'false',cbl)
            //verify(data,'msg',cbl)
            var args = arguments;
            if (args.length === 3 || L.isString(fn)) {
                cbl = msg;
                msg = fn;
                fn = 'false';
            }
            cbl = cbl || function() {};
            if (isError[fn](data)) {
                M.log('error', msg);
                M.log('info', data);
                return false;
            } else {
                cbl();
                return true;
            }
        },
        /**
         * 解析a=b&c=d
         * @param  {String} data 源字符串
         * @return {Object}      解析后的对象
         */
        getDataValue: function(data) {
            if (!data) {
                return {};
            } else {
                var value = {};
                data = data.split("&");
                var key, val;

                for (var i = 0, m = data.length; i < m; i++) {
                    data[i] = data[i].split("=");
                    key = data[i][0];
                    val = data[i][1];
                    value[key] = val == 'true' ? true : (val == 'false' ? false : val);
                    if (value[key] - 0 == value[key]) {
                        value[key] = value[key] - 0;
                    }
                }
            }
            return value;
        },
        /**
         *提取URL中参数
         *@param {string} url URL
         *@return {object} 参数的键值对对象
         */
        getUrlParam: function(url) {
            var regx = /[&|\?](\w*?)=([^&\?#]+)/g;
            return (function(o) {
                var result = null,
                    hash = {};
                result = regx.exec(o);
                while (result) {
                    hash[result[1]] = result[2];
                    result = regx.exec(o);
                }
                return hash;
            })(url);
        },
        /*
         *分析aa?dd=cc&&bb=rr
         *@param {string} url URL
         *@return {object} 对象
         */
        parseUrl:function(string){
            var regx = /[&|\?](\w*?)=([^&\?#]+)/g;
            var regn = /([\/|\w]*?)\?/;
            return (function(o) {
                var result = null,
                    hash = {};
                hash.params = {};
                result = regx.exec(o);
                if(regn.exec(o)){
                    hash.hash = regn.exec(o)[1];
                }else{
                    hash.hash = o;
                }
                while (result) {
                    hash.params[result[1]] = result[2];
                    result = regx.exec(o);
                }
                return hash;
            })(string);
        },
        /**
         * 根据URL返回host
         * @param  {String} path 源URL字符串
         * @return {String}      URL的HOST部分
         */
        getUrlHost: function(path) {
            var a = document.createElement("a"),
                host;
            a.href = path;
            host = {
                hostname: a.hostname,
                host: a.host
            };
            a = null;
            return host;
        },

        /**
         * 遍历对象的属性，如果某属性是方法，这执行该方法，并根据返回值对该属性重新赋值
         * @param  {Object} obj 源对象
         * @param  {everything} ctx 执行参数
         * @return {Object}     遍历后的对象
         */
        exeObjValue: function(obj, ctx) {
            var o = {};
            M.each(obj, function(item, key) {
                o[key] = L.isFunction(item) ? item(ctx) : item;
            });
            return o;
        },
        /**
         * 设置对象的值
         * @param {Object} o    目标对象
         * @param {String} path 属性路径 
         * @param {Everything} val  属性值
         * @example
         * setObjValue(node,'a.b','c');
         * alert(node.a.b) //输出 c
         */
        setObjValue: function(o, path, val) {
            var i,
                p = path.split('.'),
                l = p.length,
                ref = o;

            if (p.length > 0) {
                for (i = 0; ref !== UNDEFINED && i < l - 1; i++) {
                    if (!ref[p[i]]) {
                        ref[p[i]] = {};
                    }
                    ref = ref[p[i]]
                }
                ref[p[i]] = val;
            }

            return o;
        },
        /**
         * 通过字符串获取对象对应属性的值
         * @param  {Obejct} o    源对象
         * @param  {String} path 属性字符串路径
         * @return {Everything}      值
         */
        getObjValue: function(o, path) {
            if (!L.isObject(o)) {
                return UNDEFINED;
            }

            var i,
                p = path.split('.'),
                l = p.length;

            for (i = 0; i < l; i++) {
                if (o !== UNDEFINED) {
                    o = o[p[i]];
                } else {
                    return UNDEFINED;
                }
            }

            return o;
        },
        /**
        * 计算中文文本长度方法
        * @param {string} string 文本
        * @return {number} 返回中文文本长度
        */
        getChStringLen: function(string) {
            return string.replace(/[^\u00-\uFF]/g, "**").length;
        },
        /**
         * 判断是否是数组
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是数组返回true,
         */
        isArray: function(o, s, f) {
            return isType(getType(o) === ARRAY, s, f);
        },
        /**
         * 判断是否为真
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是真返回true,
         */
        isTrue: function(o, s, f) {
            return isType(!!o, s, f);
        },
        /**
         * 判断是否为布尔型
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是布尔型返回true,
         */
        isBoolean: function(o, s, f) {
            return isType(typeof o === BOOLEAN,
                s, f);
            // return typeof o === BOOLEAN;
        },
        /**
         * 判断是否为函数
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是函数返回true,
         */
        isFunction: function(o, s, f) {
            return isType(getType(o) === FUNCTION,
                s, f);
            // return getType(o) === FUNCTION;
        },
        /**
         * 判断是否为时间
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是时间返回true,
         */
        isDate: function(o, s, f) {
            return isType(getType(o) === DATE && o.toString() !== 'Invalid Date' && !isNaN(o),
                s, f);
            // return getType(o) === DATE && o.toString() !== 'Invalid Date' && !isNaN(o);
        },
        /**
         * 判断是否为数字
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是数字返回true,
         */
        isNumber: function(o, s, f) {
            return isType(typeof o === NUMBER && isFinite(o),
                s, f);
            // return typeof o === NUMBER && isFinite(o);
        },
        /**
         * 判断是否为空
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是空返回true,
         */
        isNull: function(o, s, f) {
            return isType(o === null,
                s, f);
            // return o === null;
        },
        /**
         * 判断是否为字符串
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是字符串返回true,
         */
        isString: function(o, s, f) {
            return isType(typeof o === STRING,
                s, f);
            // return typeof o === STRING;
        },
        /**
         * 判断是否为Undefined
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是Undefined返回true,
         */
        isUndefined: function(o, s, f) {
            return isType(typeof o === 'undefined',
                s, f);
        },
        /**
         * 判断是否为Object
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是Object返回true,
         */
        isObject: function(o, s, f) {
            var t = typeof o;
            return isType(o && t === OBJECT,
                s, f);
        },
        /**
         * 判断是否为空的Object
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是空的Object返回true,
         */
        isEmptyObject: function(o, s, f) {
            var b = true;
            for (var p in o) {
                return false;
            }
            return isType(b, s, f);

        },
        /**
         * 判断是否为节点
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是节点返回true,
         */
        isNode: function(el, s, f) {
            var t;
            return isType(el && typeof el === OBJECT && (t = el[NODETYPE]) && (t == 1 || t == 9), s, f);
        },
        /**
         * 对字符串进行encodeUrl编码
         * @param  {String} o 目标字符串
         * @return {String}   编码后的字符串
         */
        encodeUrl: function(o) {
            if (!o) {
                return "";
            }
            var ret = [];
            M.each(o, function(val, key) {
                ret.push(key + '=' + encodeURIComponent(val));
            });
            return ret.join('&');
        }
    };


    var L = M.Lang,
        /**
         * @lends M.Object
         */
        MObject = {
            keys: function(O) {
                var keys = [],
                    key;
                for (key in O) {
                    keys.push(key);
                }
                return keys;
            },
            /**
             * 只实现简单的obj长度换算
             * @param  {Object} O 要计算长度Object
             * @return {Int}   obj的长度
             */
            size: function(O) {
                return MObject.keys(O).length;
            }
        };

    

    //Escape方法 用于替换html标记，防止xss
    var HTML_CHARS = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;',
            '`': '&#x60;'
        },
        /**
         * @lends M.Lang.Escape
         */
        Escape = {
            /**
             * 将html转义，转移规则为HTML_CHARS
             * @param  {String} string 需要转义的字符串
             * @return {String}        转义后的字符串
             */
            html: function(string) {
                return (string + '').replace(/[&<>"'\/']/g, Escape._htmlReplacer);
            },

            /**
             * 匹配转义规则
             * @param {String} match 符号
             * @return {String} 对应的转义字符
             * @static
             * @protected
             */
            _htmlReplacer: function(match) {
                return HTML_CHARS[match];
            },
            /**
             * 返回移除了任何 HTML 或 XML 标签的字符串
             * @param {String} str 原始字符串
             * @return {String}   返回过滤后的字符串
             */
            stripTags: function(str) {
                return str.replace(/<\/?[^>]+>/gi, '');
            },
            /**
             * 返回过滤后的html文本
             * @param {String} str 原始字符串
             * @return {String} 返回过滤后的字符串
             */
            stripHTML: function(str) {
                return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/\&/g, '&amp;');
            },
            /**
             * 返回移除了任何script块的字符串
             * @param {String} str   原始字符串
             * @return {String}      返回过滤后的字符串
             */
            stripScripts: function(str) {
                return str.replace(new RegExp('<script[^>]*>([\\S\\s]*?)<\/script>', 'img'), '');
            }
        };
    /**
     * @lends M.Lang
     */
    var MTime = {
        /**
         * 根据一个日期获取当日是第几周
         * @param  {Date} date 目标日期
         * @return {Number}     周数
         */
        getWeekIndex: function(date) {
            if (!M.Lang.isDate(date)) {
                M.log('error', 'M.Lang.getWeekIndex： param "dete" is not a dateobject');
                return;
            }
            var firstDay = new Date([date.getFullYear(), 1, 1].join('/'));
            //第一天是周几
            var firstDayOfWeek = firstDay.getDay();
            //好秒差
            var subMillisends = (date - firstDay) / 86400000 /*好秒差24*60*60*1000*/ + ((firstDayOfWeek === 0 ? 0 : (firstDayOfWeek))); //1000*60

            return Math.ceil(subMillisends / 7);
        },
        /**
         * 根据周数获取日期范围
         * @param  {Number} year      目标年分
         * @param  {Number} weekIndex 周数
         * @return {Obejct}           日期范围
         * 
         */
        getWeekOfRange: function(year, weekIndex) {
            var firstDate = new Date(year, 0, 1);
            var firstDay = firstDate.getDay();
            var sDate = new Date(firstDate - firstDay * 86400000 + (weekIndex - 1) * 604800000);
            var eDate = new Date(sDate - 10 + 604800000);

            return {
                sdate: sDate,
                edate: eDate,
                start: {
                    year: sDate.getFullYear(),
                    month: sDate.getMonth() + 1,
                    date: sDate.getDate()
                },
                end: {
                    year: eDate.getFullYear(),
                    month: eDate.getMonth() + 1,
                    date: eDate.getDate()
                }
            }
        }
    };
    /**
     * @lends M.Lang
     */
    var MUserAgent = {
        isCool: function() {
            var ua = M.UA;
            if (ua.ios || ua.iphone || ua.ipad || ua.ipod) {
                return true;
            }
            return false;
        }

    }

    M.Lang.Escape = Escape;


    M.extend(M.Object, MObject);
    M.extend(M.Lang, MTime);
    M.extend(M.Lang, MUserAgent);

});