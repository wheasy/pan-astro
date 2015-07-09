/**
 *@template.js 模版
 *
 *@author zhangjian
 *@date 2013.06.26
 *@version 1.0.5
 */
Mo.define('template', function(M) {
    var L = M.Lang,
        TPL_Cache = {};
    /**
     * 模版解析类
     * @constructs  M.Template
     */

    var template = function(id, content) {
        return M.Template[M.Lang.isObject(content) ? 'render' : 'compile'].apply(M.Template, arguments);
    };
    /** @lends M.Template */
    (function(exports, global) {
        'use strict';
        exports.version = '2.0.1';
        exports.openTag = '{{'; // 设置逻辑语法开始标签
        exports.closeTag = '}}'; // 设置逻辑语法结束标签
        exports.isEscape = true; // HTML字符编码输出开关
        exports.isCompress = false; // 剔除渲染后HTML多余的空白开关
        exports.parser = null; // 自定义语法插件接口
        /**
         * 渲染模板
         * @param   {String}  tid  模板ID
         * @param   {Object}  data  数据
         * @memberOf M.Template
         * @return  {String}    渲染好的HTML字符串
         */
        exports.render = function(id, data) {

            var cache = _getCache(id);

            if (cache === undefined) {

                return _debug({
                    id: id,
                    name: 'Render Error',
                    message: 'No Template'
                });

            }

            return cache(data);
        };

        /**
         * 编译模板
         * @param   {String}  [tid]  模板ID
         * @param   {String}   tstr   模板字符串
         * @memberOf M.Template
         * @return  {Function}  渲染方法
         */
        exports.compile = function(id, source) {

            var params = arguments;
            var isDebug = params[2];
            var anonymous = 'anonymous';

            if (typeof source !== 'string') {
                isDebug = params[1];
                source = params[0];
                id = anonymous;
            }

            try {

                var Render = _compile(source, isDebug);

            } catch (e) {

                e.id = id || source;
                e.name = 'Syntax Error';

                return _debug(e);

            }

            function render(data) {

                try {

                    return new Render(data) + '';

                } catch (e) {

                    if (!isDebug) {
                        return exports.compile(id, source, true)(data);
                    }

                    e.id = id || source;
                    e.name = 'Render Error';
                    e.source = source;

                    return _debug(e);

                }

            }
            render.prototype = Render.prototype;
            render.toString = function() {
                return Render.toString();
            };

            if (id !== anonymous) {
                _cache[id] = render;
            }

            return render;

        };

        /**
         * 添加模板辅助方法
         * @param   {String}    名称
         * @param   {Function}  方法
         */
        exports.helper = function(name, helper) {
            exports.prototype[name] = helper;
        };

        /**
         * 模板错误事件
         * @name    template.onerror
         * @event
         * @ignore
         */
        exports.onerror = function(e) {
            var content = '[template]:\n' + e.id + '\n\n[name]:\n' + e.name;

            if (e.message) {
                content += '\n\n[message]:\n' + e.message;
            }

            if (e.line) {
                content += '\n\n[line]:\n' + e.line;
                content += '\n\n[source]:\n' + e.source.split(/\n/)[e.line - 1].replace(/^[\s\t]+/, '');
            }

            if (e.temp) {
                content += '\n\n[temp]:\n' + e.temp;
            }

            if (global.console) {
                console.error(content);
            }
        };

        // 编译好的函数缓存
        var _cache = {};

        // 获取模板缓存
        var _getCache = function(id) {

            var cache = _cache[id];

            if (cache === undefined && 'document' in global) {
                var elem = document.getElementById(id);

                if (elem) {
                    var source = elem.value || elem.innerHTML;
                    return exports.compile(id, source.replace(/^\s*|\s*$/g, ''));
                }

            } else if (_cache.hasOwnProperty(id)) {

                return cache;
            }
        };

        // 模板调试器
        var _debug = function(e) {

            exports.onerror(e);

            function error() {
                return error + '';
            }

            error.toString = function() {
                return '{Template Error}';
            };

            return error;
        };

        // 模板编译器
        var _compile = (function() {

            // 辅助方法集合
            exports.prototype = {
                $render: exports.render,
                $escape: function(content) {

                    return typeof content === 'string' ? content.replace(/&(?![\w#]+;)|[<>"']/g, function(s) {
                        return {
                            "<": "&#60;",
                            ">": "&#62;",
                            '"': "&#34;",
                            "'": "&#39;",
                            "&": "&#38;"
                        }[s];
                    }) : content;
                },
                $string: function(value) {

                    if (typeof value === 'string' || typeof value === 'number') {

                        return value;

                    } else if (typeof value === 'function') {

                        return value();

                    } else {

                        return '';

                    }

                }
            };

            var arrayforEach = Array.prototype.forEach ||
                function(block, thisObject) {
                    var len = this.length >>> 0;

                    for (var i = 0; i < len; i++) {
                        if (i in this) {
                            block.call(thisObject, this[i], i, this);
                        }
                    }

                };

            // 数组迭代
            var forEach = function(array, callback) {
                arrayforEach.call(array, callback);
            };

            // 静态分析模板变量
            var KEYWORDS =
                // 关键字
                'break,case,catch,continue,debugger,default,delete,do,else,false' + ',finally,for,function,if,in,instanceof,new,null,return,switch,this' + ',throw,true,try,typeof,var,void,while,with'

            // 保留字
            +',abstract,boolean,byte,char,class,const,double,enum,export,extends' + ',final,float,goto,implements,import,int,interface,long,native' + ',package,private,protected,public,short,static,super,synchronized' + ',throws,transient,volatile'

            // ECMA 5 - use strict
            + ',arguments,let,yield'

            + ',undefined';
            var REMOVE_RE = /\/\*(?:.|\n)*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|'[^']*'|"[^"]*"|[\s\t\n]*\.[\s\t\n]*[$\w\.]+/g;
            var SPLIT_RE = /[^\w$]+/g;
            var KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g');
            var NUMBER_RE = /\b\d[^,]*/g;
            var BOUNDARY_RE = /^,+|,+$/g;
            var getVariable = function(code) {

                code = code.replace(REMOVE_RE, '').replace(SPLIT_RE, ',').replace(KEYWORDS_RE, '').replace(NUMBER_RE, '').replace(BOUNDARY_RE, '');

                code = code ? code.split(/,+/) : [];

                return code;
            };

            return function(source, isDebug) {

                var openTag = exports.openTag;
                var closeTag = exports.closeTag;
                var parser = exports.parser;

                var code = source;
                var tempCode = '';
                var line = 1;
                var uniq = {
                    $data: true,
                    $helpers: true,
                    $out: true,
                    $line: true
                };
                var helpers = exports.prototype;
                var prototype = {};

                var variables = "var $helpers=this," + (isDebug ? "$line=0," : "");

                var isNewEngine = ''.trim; // '__proto__' in {}
                var replaces = isNewEngine ? ["$out='';", "$out+=", ";", "$out"] : ["$out=[];", "$out.push(", ");", "$out.join('')"];

                var concat = isNewEngine ? "if(content!==undefined){$out+=content;return content}" : "$out.push(content);";

                var print = "function(content){" + concat + "}";

                var include = "function(id,data){" + "if(data===undefined){data=$data}" + "var content=$helpers.$render(id,data);" + concat + "}";

                // html与逻辑语法分离
                forEach(code.split(openTag), function(code, i) {
                    code = code.split(closeTag);

                    var $0 = code[0];
                    var $1 = code[1];

                    // code: [html]
                    if (code.length === 1) {

                        tempCode += html($0);

                        // code: [logic, html]
                    } else {

                        tempCode += logic($0);

                        if ($1) {
                            tempCode += html($1);
                        }
                    }

                });

                code = tempCode;

                // 调试语句
                if (isDebug) {
                    code = 'try{' + code + '}catch(e){' + 'e.line=$line;' + 'throw e' + '}';
                }

                code = "'use strict';" + variables + replaces[0] + code + 'return new String(' + replaces[3] + ')';

                try {

                    var Render = new Function('$data', code);
                    Render.prototype = prototype;

                    return Render;

                } catch (e) {
                    e.temp = 'function anonymous($data) {' + code + '}';
                    throw e;
                }

                // 处理 HTML 语句
                function html(code) {

                    // 记录行号
                    line += code.split(/\n/).length - 1;

                    if (exports.isCompress) {
                        code = code.replace(/[\n\r\t\s]+/g, ' ');
                    }

                    code = code
                    // 单引号与反斜杠转义(因为编译后的函数默认使用单引号，因此双引号无需转义)
                    .replace(/('|\\)/g, '\\$1')
                    // 换行符转义(windows + linux)
                    .replace(/\r/g, '\\r').replace(/\n/g, '\\n');

                    code = replaces[1] + "'" + code + "'" + replaces[2];

                    return code + '\n';
                }

                // 处理逻辑语句
                function logic(code) {

                    var thisLine = line;

                    if (parser) {

                        // 语法转换插件钩子
                        code = parser(code);

                    } else if (isDebug) {

                        // 记录行号
                        code = code.replace(/\n/g, function() {
                            line++;
                            return '$line=' + line + ';';
                        });

                    }

                    // 输出语句. 转义: <%=value%> 不转义:<%==value%>
                    if (code.indexOf('=') === 0) {

                        var isEscape = code.indexOf('==') !== 0;

                        code = code.replace(/^=*|[\s;]*$/g, '');

                        if (isEscape && exports.isEscape) {

                            // 转义处理，但排除辅助方法
                            var name = code.replace(/\s*\([^\)]+\)/, '');
                            if (!helpers.hasOwnProperty(name) && !/^(include|print)$/.test(name)) {
                                code = '$escape($string(' + code + '))';
                            }

                        } else {
                            code = '$string(' + code + ')';
                        }

                        code = replaces[1] + code + replaces[2];

                    }

                    if (isDebug) {
                        code = '$line=' + thisLine + ';' + code;
                    }

                    getKey(code);

                    return code + '\n';
                }

                // 提取模板中的变量名
                function getKey(code) {

                    code = getVariable(code);

                    // 分词
                    forEach(code, function(name) {

                        // 除重
                        if (!uniq.hasOwnProperty(name)) {
                            setValue(name);
                            uniq[name] = true;
                        }

                    });

                }

                // 声明模板变量
                // 赋值优先级:
                // 内置特权方法(include, print) > 私有模板辅助方法 > 数据 > 公用模板辅助方法
                function setValue(name) {

                    var value;

                    if (name === 'print') {

                        value = print;

                    } else if (name === 'include') {

                        prototype['$render'] = helpers['$render'];
                        value = include;

                    } else {

                        value = '$data.' + name;

                        if (helpers.hasOwnProperty(name)) {

                            prototype[name] = helpers[name];

                            if (name.indexOf('$') === 0) {
                                value = '$helpers.' + name;
                            } else {
                                value = value + '===undefined?$helpers.' + name + ':' + value;
                            }
                        }

                    }

                    variables += name + '=' + value + ',';
                }

            };
        })();

    })(template, M.config.win);
    (function(exports) {

        exports.openTag = '{{';
        exports.closeTag = '}}';
        var _helpers = exports.prototype;

        exports.parser = function(code) {
            code = code.replace(/^\s/, '');

            var args = code.split(' ');
            var key = args.shift();
            var keywords = exports.keywords;
            var fuc = keywords[key];

            if (fuc && keywords.hasOwnProperty(key)) {

                args = args.join(' ');
                code = fuc.call(code, args);

            } else if (exports.prototype.hasOwnProperty(key)) {

                args = args.join(',');
                code = '==' + key + '(' + args + ');';

            } else {

                code = code.replace(/[\s;]*$/, '');
                code = '=' + code;
            }

            return code;
        };

        exports.keywords = {

            'if': function(code) {
                return 'if(' + code + '){';
            },

            'else': function(code) {
                code = code.split(' ');

                if (code.shift() === 'if') {
                    code = ' if(' + code.join(' ') + ')';
                } else {
                    code = '';
                }

                return '}else' + code + '{';
            },

            '/if': function() {
                return '}';
            },

            'each': function(code) {

                code = code.split(' ');

                var object = code[0] || '$data';
                var as = code[1] || 'as';
                var value = code[2] || '$value';
                var index = code[3] || '$index';

                var args = value + ',' + index;

                if (as !== 'as') {
                    object = '[]';
                }

                return '$each(' + object + ',function(' + args + '){';
            },

            '/each': function() {
                return '});';
            },

            'echo': function(code) {
                return 'print(' + code + ');';
            },

            'include': function(code) {
                code = code.split(' ');

                var id = code[0];
                var data = code[1];
                var args = id + (data ? (',' + data) : '');

                return 'include(' + args + ');';
            }

        };

        exports.helper('$each', function(data, callback) {

            var isArray = Array.isArray ||
                function(obj) {
                    return Object.prototype.toString.call(obj) === '[object Array]';
                };

            if (isArray(data)) {
                for (var i = 0,
                    len = data.length; i < len; i++) {
                    callback.call(data, data[i], i, data);
                }
            } else {
                for (i in data) {
                    callback.call(data, data[i], i);
                }
            }

        });

        template.helper('$encodeURIComponent', function(u) {
            var s = '';
            try {
                s = decodeURIComponent(u);
            } catch (er) {}
            return encodeURIComponent(s || u);
        });
        //处理html
        template.helper('$htmlparser', function(u) {
            var s = '';
            try {
                s = u.replace(/<\/?[^>]*>/g,'');
            } catch (er) {}
            return s;
        });
        //处理img路径
        //size:211x211
        template.helper('$imgparser', function(u,size) {
            var s = $appCfg.imgsvr,
                size = size||'130x130';
                //u='http://10.8.8.29/resize_130x130/ImageWorkerPath/Groupon/2/20150305/317049c39968436996847cda1c641cfc.jpg';
                //console.log(size);
                //u="/ImageWorkerPath/Groupon/2/20150305/12722fac665d47a1adfaa65be4001acd.jpg";
            try {
                //console.log(/http:\/\//.test(u));
                if(/^http:\/\//.test(u)){
                    s = u;
                }else{
                    s = s+'resize_'+size+'/'+u;
                }
            } catch (er) {}
            return s;
        });
    })(template);
    /**
     * 获取模板
     * @param  {string} key 模板名称，对应资源路径为$res.tpl['key'],如“cmt-reply”,'cmt.reply'
     * @return {Object}
     */
    template.get = function(k) {
        var ret = TPL_Cache[k];
        if (ret) {
            return ret;
        }
        ret = L.getObjValue($res.tpl, k);
        L.verify(!L.isUndefined(ret), 'template.get-->$res.tpl.' + k + ' is not undefined', function() {
            ret = template(ret);
            TPL_Cache[k] = ret;
        });
        return ret;

    };
    M.Template = template;
});