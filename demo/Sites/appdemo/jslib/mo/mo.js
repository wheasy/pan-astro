/**
 * 种子入口
 */
(function(win, undef) {
    var mo = function() {
            var m = this,
                instanceOf = function(o, type) {
                    return (o && o.hasOwnProperty && (o instanceof type));
                };
            if (!instanceOf(m, mo)) {
                m = new mo();
            } else {
                m._init();
            }
            m.instanceOf = instanceOf;
            return m;
        },
        guid = (new Date()).getTime(),
        EMPTY = '',
        NAME = 'moui',
        readyList = [],
        NO_ARGS = [],
        config = {
            win: win,
            doc: document,
            prefix: 'id'
        },
        STRING = 'string',
        FUNC = 'function',
        LOADING = 'loading',
        OBJ = 'object',
        ARRAY = 'array',
        NTYPE = 'nodeType',
        TOSTRING = Object.prototype.toString,
        ObjectCreate = Object.create,
        emptyFn = function() {},
        TYPES = {
            'undefined': 'undefined',
            'number': 'number',
            'boolean': 'boolean',
            'string': STRING,
            '[object Function]': FUNC,
            '[object RegExp]': 'regex',
            '[object Array]': ARRAY,
            '[object Date]': 'date',
            '[object Error]': 'error'
        },
        instances = {},
        M, Lang, loader,
        /**
         * 将属性或方法从一个对象复制到另一个对象
         * @param  {String} [p] 属性或方法
         * @param  {Object} [target] 目标对象
         * @param  {Object} [source] 源对象
         * @param  {Boolean} [ov] 是否强制覆盖
         * @return {Null}
         */
        _apply = function(p, target, source, ov) {
            if (ov || !(p in target)) {
                target[p] = source[p];
            }
        },
        getType = function(o) {
            if (typeof o === OBJ && !!o && o.nodeType !== undefined) {
                if (o.nodeType === 3) {
                    return (/\S/).test(o.nodeValue) ? 'textnode' : 'whitespace';
                } else {
                    return 'element';
                }
            } else {
                return TYPES[typeof o] || TYPES[TOSTRING.call(o)] || (o ? OBJ : 'NULL');
            }
        },
        proto;

    mo.Mods = {};

    /** @lends M*/
    proto = {
        namespace: function() {
            var a = arguments,
                o = this,
                i = 0,
                j, d, arg, PERIOD = '.';
            for (; i < a.length; i++) {
                // d = ('' + a[i]).split('.');
                arg = a[i];
                if (arg.indexOf(PERIOD)) {
                    d = arg.split(PERIOD);
                    for (j = (d[0] == 'M') ? 1 : 0; j < d.length; j++) {
                        o[d[j]] = o[d[j]] || {};
                        o = o[d[j]];
                    }
                } else {
                    o[arg] = o[arg] || {};
                }
            }
            return o;
        },
        each: function(o, handle, ctx) {
            var length, i;
            if (!o || !getType(handle) === FUNC) {
                return;
            }
            if (getType(o) === ARRAY) {
                for (i = 0, length = o.length; i < length; i++) {
                    if (handle.call(ctx || o[i], o[i], i) === false) {
                        break;
                    }
                }

            } else {
                for (i in o) {
                    if (handle.call(ctx || o[i], o[i], i) === false) {
                        break;
                    }
                }
            }
        },
        config: config,
        _init: function() {
            var m = this;
            //M._excuteFn(mod.fn)
            m.constructor = Mo;
            //加载依赖的核心组件
            // m._attach(config.core);

            m.id = this.stamp(m);
            instances[m.id] = m;
        },
        getType: getType,
        UA: (function() {
            //设备类型检测 from YUI 3.10.1
            var numberify = function(s) {
                    var c = 0;
                    return parseFloat(s.replace(/\./g,
                        function() {
                            return (c++ === 1) ? '' : '.';
                        }));
                },

                win = window || null,

                nav = win && win.navigator,

                o = {
                    ie: 0,
                    opera: 0,
                    gecko: 0,
                    webkit: 0,
                    safari: 0,
                    chrome: 0,
                    mobile: null,
                    air: 0,
                    ipad: 0,
                    iphone: 0,
                    ipod: 0,
                    ios: null,
                    android: 0,
                    os: null,
                    touchEnabled: false,
                    weixin: 0
                },

                ua = nav && nav.userAgent,
                loc = win && win.location,
                href = loc && loc.href,
                m;

            o.userAgent = ua;

            if (ua) {

                if ((/windows|win32/i).test(ua)) {
                    o.os = 'windows';
                } else if ((/macintosh|mac_powerpc/i).test(ua)) {
                    o.os = 'macintosh';
                } else if ((/android/i).test(ua)) {
                    o.os = 'android';
                } else if ((/symbos/i).test(ua)) {
                    o.os = 'symbos';
                } else if ((/linux/i).test(ua)) {
                    o.os = 'linux';
                } else if ((/rhino/i).test(ua)) {
                    o.os = 'rhino';
                }

                // Modern KHTML browsers should qualify as Safari X-Grade
                if ((/KHTML/).test(ua)) {
                    o.webkit = 1;
                }
                if ((/IEMobile|XBLWP7/).test(ua)) {
                    o.mobile = 'windows';
                }
                if ((/Fennec/).test(ua)) {
                    o.mobile = 'gecko';
                }
                if ((/MicroMessenger/i).test(ua)){
                    o.weixin = 1;
                }
                // Modern WebKit browsers are at least X-Grade
                m = ua.match(/AppleWebKit\/([^\s]*)/);
                if (m && m[1]) {
                    o.webkit = numberify(m[1]);
                    o.safari = o.webkit;

                    if (/PhantomJS/.test(ua)) {
                        m = ua.match(/PhantomJS\/([^\s]*)/);
                        if (m && m[1]) {
                            o.phantomjs = numberify(m[1]);
                        }
                    }

                    // Mobile browser check
                    if (/ Mobile\//.test(ua) || (/iPad|iPod|iPhone/).test(ua)) {
                        o.mobile = 'Apple'; // iPhone or iPod Touch

                        m = ua.match(/OS ([^\s]*)/);
                        if (m && m[1]) {
                            m = numberify(m[1].replace('_', '.'));
                        }
                        o.ios = m;
                        o.os = 'ios';
                        o.ipad = o.ipod = o.iphone = 0;

                        m = ua.match(/iPad|iPod|iPhone/);
                        if (m && m[0]) {
                            o[m[0].toLowerCase()] = o.ios;
                        }
                    }

                    m = ua.match(/(Chrome|CrMo|CriOS)\/([^\s]*)/);
                    if (m && m[1] && m[2]) {
                        o.chrome = numberify(m[2]); // Chrome
                        o.safari = 0; //Reset safari back to 0
                        if (m[1] === 'CrMo') {
                            o.mobile = 'chrome';
                        }
                    } else {
                        m = ua.match(/AdobeAIR\/([^\s]*)/);
                        if (m) {
                            o.air = m[0]; // Adobe AIR 1.0 or better
                        }
                    }
                }

                if (!o.webkit) { // not webkit
                    // @todo check Opera/8.01 (J2ME/MIDP; Opera Mini/2.0.4509/1316; fi; U; ssr)
                    if (/Opera/.test(ua)) {
                        m = ua.match(/Opera[\s\/]([^\s]*)/);
                        if (m && m[1]) {
                            o.opera = numberify(m[1]);
                        }
                        m = ua.match(/Version\/([^\s]*)/);
                        if (m && m[1]) {
                            o.opera = numberify(m[1]); // opera 10+
                        }

                        if (/Opera Mobi/.test(ua)) {
                            o.mobile = 'opera';
                            m = ua.replace('Opera Mobi', '').match(/Opera ([^\s]*)/);
                            if (m && m[1]) {
                                o.opera = numberify(m[1]);
                            }
                        }
                        m = ua.match(/Opera Mini[^;]*/);

                        if (m) {
                            o.mobile = m[0]; // ex: Opera Mini/2.0.4509/1316
                        }
                    } else { // not opera or webkit
                        m = ua.match(/MSIE\s([^;]*)/);
                        if (m && m[1]) {
                            o.ie = numberify(m[1]);
                        } else { // not opera, webkit, or ie
                            m = ua.match(/Gecko\/([^\s]*)/);
                            if (m) {
                                o.gecko = 1; // Gecko detected, look for revision
                                m = ua.match(/rv:([^\s\)]*)/);
                                if (m && m[1]) {
                                    o.gecko = numberify(m[1]);
                                    if (/Mobile|Tablet/.test(ua)) {
                                        o.mobile = "ffos";
                                    }
                                }
                            }
                        }
                    }
                }
            }
            //Check for known properties to tell if touch events are enabled on this device or if
            //the number of MSPointer touchpoints on this device is greater than 0.
            if (win && nav && !(o.chrome && o.chrome < 6)) {
                o.touchEnabled = (("ontouchstart" in win) || (("msMaxTouchPoints" in nav) && (nav.msMaxTouchPoints > 0)));
            }

            //It was a parsed UA, do not assign the global value.

            return o;
        }()),
        /**
         * log封装
         * @param  {String} [t] 类型
         * @param  {String} [msg] 消息
         * @return {Null}
         */
        log: function (t, msg) {
            if (!window.console) {
                return;
            }
            var arg = arguments,
                arg_call = [],
                i, log;
            if (arg.length === 1 || !console[t]) {
                log = console.log;
                if (arg.length === 1) {
                    msg = t;
                    arg_call = [msg];
                    t = undefined;
                } else {
                    arg_call = [t, msg];
                }
            } else if (console[t]) {
                log = console[t];
                for (i = 1; i < arg.length; i++) {
                    arg_call.push(arg[i]);
                }
            }
            if (this.UA.ie) {
                t = t || 'M.log:';
                console.log(t, msg);
            } else {
                log.apply(console, arg_call);
            }
        },
        /*
         * 返回当前时间，毫秒.
         * @return {String} 当前时间
         * @method now
         */
        now: Date.now || function() {
            return +new Date();
        },
        /*
         * 生成全局唯一ID.
         * @param {String} [pre] guid的前缀
         * @return {String} 返回guid
         */
        guid: function(pre) {
            var id = NAME + '_' + (++guid);
            return (pre) ? (pre + id) : id;
        },
        /**
         * 获取节点标识
         * @param {String} [o] 节点或字符串
         * @param {Boolean} [readOnly] 是否为只读
         * @return {String} 返回标识
         */
        stamp: function(o, readOnly) {
            var uid;
            if (!o) return o;

            // IE generates its own unique ID for dom nodes
            // The uniqueID property of a document node returns a new ID
            if (o.uniqueID && o[NTYPE] && o[NTYPE] !== 9) {
                uid = o.uniqueID;
            } else {
                uid = (typeof o === STRING) ? o : o.id;
            }

            if (!uid) {
                uid = this.guid();
                if (!readOnly) {
                    try {
                        o.id = uid;
                    } catch (e) {
                        uid = null;
                    }
                }
            }
            return uid;
        },
        /**
         * 将两个对象混合
         * @param {String} [r] 目标对象
         * @param {String} [s] 源对象
         * @param {String} [ov] 是否强制覆盖目标对象的属性或方法
         * @param {String} [wl] 选择需要覆盖的属性或方法
         */
        mix: function(r, s, ov, wl) {
            if (!s || !r) return r;
            if (ov === undef) ov = true;
            var i = 0,
                p, len;

            if (wl && (len = wl.length)) {
                for (; i < len; i++) {
                    p = wl[i];
                    if (p in s) {
                        _apply(p, r, s, ov);
                    }
                }
            } else {
                for (p in s) {
                    _apply(p, r, s, ov);
                }
            }
            return r;
        },
        /**
         *将第二个对象合并到一个新的对象上,并返回
         *@param {object} arguments 将所有参数合并
         *@return {object} 返回merge后的新对象
         */
        merge: function() {
            var a = arguments,
                o = {},
                i, l = a.length;
            for (i = 0; i < l; i = i + 1) {
                a[i] = (typeof a[i] === OBJ) ? a[i] : {};
                mo.mix(o, a[i], true);
            }
            return o;
        },
        /**
         * 继承方法
         *@param {string} r
         *@param {string} s
         *@param {string} px prototype属性
         *@param {string} sx 要增加的新属性
         *@return 返回新对象或方法
         */
        extend: function(r, s, px, sx) {
            if (!s || !r) return r;
            var sp = s.prototype,
                rp;


            // add prototype chain
            if (typeof s === FUNC) {
                rp = this.create(sp, r);
                r.prototype = this.mix(rp, r.prototype);
                //chain r's constrator
                r.superclass = this.create(sp, s);
            }
            if (typeof s === OBJ) {
                this.mix(r.prototype || r, s);
            }
            //新增原型属性
            if (px) {
                M.mix(rp, px);
            }
            //新加入属性
            if (sx) {
                M.mix(r, sx);
            }

            return r;
        },
        /**
         *  对setInterval和setTimeout封装
         * @param  {Int} [when] 延迟时间
         * @param  {Object} [o] 对象
         * @param  {Function} [fn] 方法，如果是字符串，会调用o的对应方法
         * @param  {Array} [data] 回调给回调方法的参数
         * @param  {Boolean} [periodic] 是否为定时循环调用
         * @return {Object} 
         */
        later: function(when, o, fn, data, periodic) {
            when = when || 0;
            data = (!M.Lang.isUndefined(data)) ? M.Array.toArray(data) : NO_ARGS;
            o = o || M.config.win || M;

            var cancelled = false,
                method = (o && M.Lang.isString(fn)) ? o[fn] : fn,
                wrapper = function() {
                    if (!cancelled) {
                        if (!method.apply) {
                            method(data[0], data[1], data[2], data[3]);
                        } else {
                            method.apply(o, data || NO_ARGS);
                        }
                    }
                },
                id = (periodic) ? setInterval(wrapper, when) : setTimeout(wrapper, when);

            return {
                id: id,
                interval: periodic,
                cancel: function() {
                    cancelled = true;
                    if (this.interval) {
                        clearInterval(id);
                    } else {
                        clearTimeout(id);
                    }
                }
            };
        },
        /**
         * 创建一个具有指定原型且可选择性地包含指定属性的对象
         * 对Object.create的封装兼容
         * 
         * @param  {Object} [proto] prototype
         * @param  {Object} [c] 扩展的方法
         * @return {Object} 一个具有指定的内部原型且包含指定的属性（如果有）的新对象。
         */
        create: function(proto, c) {
            var newPrototype;
            if (ObjectCreate) {
                newPrototype = ObjectCreate(proto);
            } else {
                emptyFn.prototype = proto;
                newPrototype = new emptyFn();
            }
            newPrototype.constructor = c;
            return newPrototype;
        },
        /*注册模块
         *@param name {string} 组件名称
         *@param f {function} 组件实现函数
         */
        define: function(name, f) {
            //TODO判断名称是否符合命名规则
            //如果已经注册，则警告
            //如果设置了版本号,则
            mo.Mods[name] = {};
            var mod = mo.Mods[name];
            //正在加载的模块
            if (!mod) {
                log('warn', name + ' has not been registered!    (没有通过Mo.addModule注册)');
                return;
            }
            if (mod.executed) {
                log('warn', name + ' has been registered!');
            }
            mod.fn = f;
            mod.executed = true;
            mod.status = 'success';
            M._excuteFn(mod.fn);
        },
        /**
         *@param [req] {Arrry} 依赖的组件
         *@param cbl {function} 依赖加载完毕后要执行的函数
         *@param [version] {string} 依赖加载完毕后要执行的函数
         */
        require: function(reqs, cbl) {
            if (typeof reqs == FUNC) {
                cbl = reqs;
                reqs = '';
            }
            cbl(M);
        },
        /**
         *@description  在沙箱中执行函数
         *@method _excuteFn
         *@param f {function}函数
         */
        _excuteFn: function(f) {
            //TODO 每次new一个或者clone一个
            var m = this;
            if (f == undef) {
                m.log('warn', '_excuteFn: f is undefined');
                return false;
            }
            try {
                f.apply(m, [m]);
                return true;
            } catch (error) {
                //TODO 如果是调试，则抛出异常，并设置标识符，尝试加载一次
                debugger
                m.log('warn', 'there is a error in _ex cuteFn!', error);
                throw error;
            }
        }
    };
    mo.prototype = proto;
    for (var prop in proto) {
        if (proto.hasOwnProperty(prop)) {
            mo[prop] = proto[prop];
        }
    }

    win.Mo = mo;
    M = new Mo();
}(this));