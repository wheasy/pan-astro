/**
    编译器,解析模板
*/
Mo.define('compiler', function(M) {
    var moto = Mt,
        _drivers = {},
        L = M.Lang,
        EACH_IS_EMPTY = '$each_isempty',
        keywords =
        // 关键字
        'break,case,catch,continue,debugger,default,delete,do,else,false' + ',finally,for,function,if,in,instanceof,new,null,return,switch,this' + ',throw,true,try,typeof,var,void,while,with'
        // 保留字
        + ',abstract,boolean,byte,char,class,const,double,enum,export,extends' + ',final,float,goto,implements,import,int,interface,long,native' + ',package,private,protected,public,short,static,super,synchronized' + ',throws,transient,volatile'
        // ECMA 5 - use strict
        + ',arguments,let,yield' + ',undefined',
        rrexpstr = /\/\*(?:.|\n)*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|'[^']*'|"[^"]*"|[\s\t\n]*\.[\s\t\n]*[$\w\.]+/g,
        rsplit = /[^\w$]+/g,
        rkeywords = new RegExp(["\\b" + keywords.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g'),
        rnumber = /\b\d[^,]*/g,
        rcomma = /^,+|,+$/g,
        getVariables = function(code) {
            code = code
                .replace(rrexpstr, '')
                .replace(rsplit, ',')
                .replace(rkeywords, '')
                .replace(rnumber, '')
                .replace(rcomma, '');

            return code ? code.split(/,+/) : [];
        },
        precompile_tmp_div = M.Node.create('<div>');

    var scopeBase = {
        //发射事件，冒泡的形式向上传递，直到最高一级时，触发
        $emit: function(eventName, data) {
            var scope = this;
            var tscope = scope;
            while (scope = scope.$parent) {
                tscope = scope;
            };
            tscope.$fire.apply(tscope, arguments);
        },
        $getTopScope: function() {
            var tscope = this;
            while (tscope.$parent) {
                tscope = tscope.$parent
            }
            return tscope;
        },
        //向所有scope广播事件
        $broadcast: function(evetName, source) {
                var scope = this;
                M.each(scope.$supper, function(scope_child) {
                    scope_child.$fire(evetName);
                    if (scope_child != source) {
                        scope_child.$broadcast(evetName, source)
                    }
                });
            }
            // ,$on: function(name, handle, context) {
            //     var scope = this;
            //     scope.$events = scope.$events || {};
            //     scope.$events[name] = scope.$events[name] || {}
            //     scope.$events[name][M.stamp(handle)] = {
            //         fn: handle,
            //         context: context
            //     };
            // },
            // $off: function(name, fn) {
            //     var scope = this,
            //         gid = M.stamp(fn),
            //         ets = scope.$events || {};
            //     ets = ets['name'] || {};
            //     delete ets[gid];
            // },
            // $fire: function(name) {
            //     //M.log('$fire'+":"+name);
            //     var scope = this,
            //         es,
            //         args = M.Array.toArray(arguments).slice(1);
            //     scope.$events = scope.$events || {};
            //     es = scope.$events[name];

        //     M.each(es, function(handle) {
        //         handle.fn.apply(handle.context || scope, args);
        //     });
        // }
    };
    moto.scopeBase = scopeBase;

    //催化剂
    var catalyzer = {},
        //修饰变量//遍历所有的[mt-each]，如果需要改变作用域，
        decorateVars = function(vars, scope) {
            var p = [
                [],
                []
            ];
            M.each(vars, function(v) {
                p[0].push(v);
                p[1].push(scope[v] || undefined);
            });
            return p;
        },
        getFunction = function(code, scope) {
            var vs = getVariables(code),
                v2 = decorateVars(vs, scope),
                fn = Function.apply(Function, v2[0].concat('return ' + code));
            return fn.apply(fn, v2[1]);
        };

    //催化剂
    M.extend(catalyzer, {
        mtLoading: function(scope, ele, attrs) {
            ele.setHTML('loading');
        },
        mtSrc: function(scope, ele, attrs) {
            ele.set('src', ele.getAttr('mt-src'));
        },
        mtBind: function(scope, ele, attrs) {
            ele.set('value', ele.getAttr('mt-bind'));
        },
        //TODO 判断是否是数组(用逗号隔开)
        mtPlugin: function(scope, ele, attrs) {
            //plug-lazy 属性, 在使组件在页面loaded 300毫秒后初始化
            function p() {
                if (!scope.$plugs) {
                    scope.$plugs = {};
                }
                var plug,
                    es,
                    plugName,
                    cfg,
                    plugIndex;
                plugName = attrs['mt-plugin']; //ele.getAttr('mt-plugin');
                plugIndex = attrs['plugin-index']; // && attrs['plugin-index'];
                if (plug = M.Plugin[plugName]) {
                    if (plug.unInstance) {
                        ele[plugName] = plug.init(scope, ele, scope.$pluginCfg && scope.$pluginCfg[plugIndex]);
                    } else {
                        cfg = M.Lang.getDataValue(ele.getAttr('plugin-attrs'));
                        if (scope.$pluginCfg && scope.$pluginCfg[plugIndex]) {
                            cfg = M.extend(cfg, scope.$pluginCfg[plugIndex]);
                        }
                        // cfg = scope.$pluginCfg && scope.$pluginCfg[plugIndex] ? scope.$pluginCfg[plugIndex] : {}
                        cfg.scope = scope;
                        ele.plug(plugName, cfg);
                        // ele[plugName] = new plug(scope, ele, scope.$pluginCfg && scope.$pluginCfg[plugIndex] ? scope.$pluginCfg[plugIndex] : null);
                        if (plugIndex) {
                            scope.$plugs[plugIndex] = ele[plugName];
                        }
                    }
                }else{
                    console.log('warn', 'plugin "'+ 'mt-' + plugName + '" 未找到！' );
                }
            }
            if (ele.getAttr('plug-lazy')) {
                scope.$on('loaded_lazy', p);
                return;
            }
            p();
        },
        mtDisabled: function(scope, ele, attrs) {
            var code = attrs['mt-disabled'],
                val = getFunction(code, scope);
            ele.set('disabled', val);
        },
        mtChange: function(scope, ele, attrs) {
            var method = attrs['mt-change'];
            if (!method) {
                M.log('MTChange:method is null', {
                    element: ele,
                    scope: scope
                });
                return;
            }
            ele.on('change', function(evt) {
                if (ele.getAttr('disable')) {
                    return;
                }
                var m = scope[method];
                if (!m) {
                    M.log('warn', 'mt-change:    ' + method + '        ' + new Date());
                    return;
                }
                //TODO 暂不确定作用域和参数
                m.apply(scope, [ele]);
            });
        },
        mtKeyup: function(scope, ele, attrs) {
            var method = attrs['mt-keyup'];
            if (!method) {
                M.log('MTkeyup:method is null', {
                    element: ele,
                    scope: scope
                });
                return;
            }
            ele.on('keyup', function(evt) {
                if (ele.getAttr('disable')) {
                    return;
                }
                var m = scope[method];
                if (!m) {
                    M.log('warn', 'mt-change:    ' + method + '        ' + new Date());
                    return;
                }
                //TODO 暂不确定作用域和参数
                m.apply(scope, [ele]);
            });
        },
        mtClick: function(scope, ele, attrs) {
            var method = attrs['mt-click'];
            if (!method) {
                M.log('mtClick:method is null', {
                    element: ele,
                    scope: scope
                });
                return;
            }
            ele.on('click', function(evt) {
                evt.halt();
                if (ele.getAttr('disable')) {
                    return;
                }
                var m = L.getObjValue(scope, method);
                if (!m) {
                    M.log('warn', 'mt-click:    ' + method + '        ' + new Date());
                    return;
                }
                //TODO 暂不确定作用域和参数
                return m.apply(scope, [ele, evt]);
            })
        },
        mtBlur: function(scope, ele, attrs) {
            var method = attrs['mt-blur'];
            if (!method) {
                M.log('mt-blur:method is null', {
                    element: ele,
                    scope: scope
                });
                return;
            }
            ele.on('blur', function(evt) {
                if (ele.getAttr('disable')) {
                    return;
                }
                var m = L.getObjValue(scope, method);
                if (!m) {
                    M.log('warn', 'mt-blur:    ' + method + '        ' + new Date());
                    return;
                }
                //TODO 暂不确定作用域和参数
                m.apply(scope, [ele]);
            })
        },
        //元素的隐藏和显示
        mtHide: function(scope, ele, attrs) {
            var code = attrs['mt-hide'];
            if (!code) {
                ele.hide();
                return;
            }
            ele.toggle(getFunction(code, scope));
        }, //
        mtHref: function(scope, ele, attrs) {
            if (!attrs['mt-href']) {
                return;
            }
            ele.on('click', function(evt) {
                evt.halt();
                scope.$getTopScope().get('app').router.redirect(attrs['mt-href'])
            });
        },
        mtButton: function(scope, ele, attrs) {
            var cls = attrs['mt-button'];
            ele.addClass(cls);
            ele.disable = function() {
                ele.set('disabled', true);
            }
            ele.enable = function() {
                ele.set('disabled', false);
            }
        }
    });
    var PerComiler_Cache = {};
    var compiler = {
        render: function(scope, host, notPer, perKey) {
            //在正式渲染之前,对代码进行处理,抽出需要变更作用域的部分
            // if(!scope.$precompiled){
            if (!notPer) {
                compiler.precompile(scope, perKey);
            }
            // scope.$precompiled
            // }

            // console.log(scope);
            var s = '';
            try {
                s = compiler.compilePect(scope);
            } catch (err) {
                M.log('渲染异常:', err);
            }
            if (s && s.size) {
                host.setHTML(s);
            }
            // note: driver,mt-each  未指定mt-each,在预编译的时候,
            //       会覆盖scope的$tpl属性,故在把原$tpl缓存在parent属性中,
            //       在渲染完成后,再设置回来
            if (scope.$tpl.parent) {
                scope.$tpl = scope.$tpl.parent;
            }
            host.setData('$scope', scope);
        },
        //预编译,提取有特殊作用域的部分，目前只有repeat语法和driver
        //TODO 通过innerHTML的方法分解模板时,src属性会被加载
        /**
         * [precompile description]
         * @param  {type} scope     [description]
         * @param  {type} cache_key [description]
         * @param  {type} ketPer    [description]
         * @return {type}           [description]
         */
        precompile: function(scope, cache_key, keyPer) {
            // M.stamp(scope, false, '$moid');
            //处理需要改变作用域的催化剂  现在只有each
            if (cache_key) {
                if (PerComiler_Cache[cache_key]) {
                    scope.$tpl = PerComiler_Cache[cache_key];
                    return;
                }
            }
            // console.count('precompile')
            var htm = scope.$html,
                mts,
                ret = {
                    holders: {}
                };

            if (htm !== '' && !htm) {
                M.log('error', '找不到模板$html', scope);
            }

            //为所有有mt-attrName形式属性的节点增加空mt属性
            //precompile_tmp_div.setHTML(htm.replace(/(<\w+.*?)(\smt[a-z,-]\w+.*?>)/ig, '$1 mt$2'));

            precompile_tmp_div.set('innerHTML', htm
                .replace(/(<img.*? )(src)(\=\"[\s\S]*?\"(.*?)?\/?\>)/ig, '$1mt mt-src$3')
            );

            mts = M.all('[mt-each]', precompile_tmp_div);
            //遍历所有的[mt-each]，如果需要改变作用域，
            mts.each(function(ele) {
                //1.获取节点内容作模板
                //2.设置节点内容为空
                /* old
                var holder = M.Node.create('<mt-holder>');
                ret.holders[M.stamp(holder)] = ele;
                ret.holders[gid] = ele;
                */
                //new 
                var gid = M.guid();
                var holder = M.Node.create('<mt-holder id="' + gid + '">');
                // ret.holders[gid] = {
                //     tpl: ele.getHTML(),
                //     attrs: ele.get('attributes')
                // };
                ret.holders[gid] = ele;
                ele.replace(holder);
            });
            ret.pect = precompile_tmp_div.getHTML().replace(/&gt;/ig, '>')
                .replace(/&lt;/ig, '<')
                .replace(/&amp;/ig, '&');
            // .replace(/(\<img.*? )(src)(\=\"[\s\S]*?\"(.*?)?\/?\>)/ig, '$1mt mt-src$3');
            //TODO 换成通过正则处理模板
            // debugger;
            // scope.complier = M.Template(htm
            //     .replace(/(<\w+.*?)(\smt[a-z,-]\w+.*?>)/ig, '$1 mt$2')
            //     .replace(/&gt;/ig, '>')
            //     .replace(/&lt;/ig, '<')
            //     .replace(/&amp;/ig, '&'), null, scope.$moid);
            // console.log(scope.complier);
            precompile_tmp_div.empty();
            // note: driver,mt-each  未指定mt-each,在预编译的时候,
            //会覆盖scope的$tpl属性,故在把原$tpl缓存在parent属性中,
            //在渲染完成后,再设置回来
            if (scope.$tpl) {
                var t = scope.$tpl;
                ret.parent = t;
            }
            scope.$tpl = ret;
            if (cache_key) {
                PerComiler_Cache[cache_key] = ret;
            }

            // scope.$tpl.parent = t;

        },
        processHolder: function(scope, host) {
            //如果是each中包含的each, holder通过parent_tpl 传递过来
            var code = scope.$parent_tpl || scope.$tpl;

            var mtHoldes = host.all('mt-holder');

            mtHoldes && mtHoldes.each(function(ele) {
                var key = ele.getAttr('id');

                var hoderHost = code.holders[key];

                if (!hoderHost) {
                    return;
                }
                hoderHost = hoderHost.cloneNode(true);
                // 只需要处理each
                ele.replace(_drivers['mtEach'].fn(scope, hoderHost));
                /*
                M.each(M.Array.toArray(attrs), function(attr) {
                    var aName = attr.name.replace(/mt\-(\w)/, function() {
                        return 'mt' + arguments[1].toUpperCase();
                    });
                    // if (aName.indexOf('mt') === 0 && _drivers[aName]) {
                    if (aName.indexOf('mt') === 0 && _drivers[aName]) {
                        // ele.replace('hello');
                        // mtPlugin: function(scope, ele, attrs) {

                        // console.log(_drivers[aName].fn(scope, hoderHost, attrs));
                        ele.replace(_drivers[aName].fn(scope, hoderHost, attrs));
                        // return false;
                    }
                });*/
            });

        },
        /**
        *@param scope {Object} 作用域
        *@code {Object} 处理过的作用域的模板
            {
                holder:{},  //
                pect:''     //处理过的模板
                tpl:''      //原装模板
            }
        *@param  host {Node}作用宿主
        */
        compilePect: function(scope) {
            M.stamp(scope, false, '$moid');
            var code = scope.$tpl,
                tempDiv = M.Node.create('<div>');
            //TODO 换成通过正则处理模板
            tempDiv.setHTML(M.Template(code.pect)(scope));
            //渲染视图
            M.all('[mt]', tempDiv).each(function(host) {
                host.removeAttr('mt');
                var attrs_array = host.get('attributes'),
                    $scope = host.getAttr('mt-scope') && L.getObjValue(scope, host.getAttr('mt-scope')),
                    attrs = {},
                    mts = [];
                M.each(M.Array.toArray(attrs_array), function(attr) {
                    if (attr.name.indexOf('mt-') == 0) {
                        mts.push(attr);
                    }
                    if (attr.name !== 'id') {
                        attrs[attr.name] = attr.value;
                    }
                });
                if ($scope) {
                    setScopeParent($scope, scope);
                } else {
                    // console.log('warn', 'moto-compiler: scope is null');
                    // console.log(host.getHTML());
                    // return;
                    $scope = scope;
                }
                // attrs_array.length = 0;
                // console.log(mts);
                //TODO  在PC端，把属性和节点绑定
                M.each(mts, function(attr) {
                    var matched = false;
                    var aName = attr.name.replace(/mt\-(\w)/, function() {
                        matched = true;
                        return 'mt' + arguments[1].toUpperCase();
                    });
                    if (!matched) {
                        return
                    };
                    //处理催化剂
                    if (catalyzer[aName]) {
                        catalyzer[aName]($scope, host, attrs);
                    }
                    //处理驱动器
                    if (_drivers[attr.value]) {
                        host.addClass('dr-' + attr.value);
                        if (_drivers[attr.value].fn) {
                            M.extend($scope, Mt.scopeBase);
                            _drivers[attr.value].fn($scope, host, attrs, M);
                        }
                        host.setData('$scope', $scope);
                        host.$updateView = function(scope) {
                            var $scope = scope || this.getData('$scope'),
                                perObj = {
                                    $html: moto.getTpl('d', attr.value)
                                },
                                _t;
                            if ($scope.$tpl) {
                                _t = $scope.$tpl;
                            }
                            compiler.precompile(perObj, 'd_' + attr.value);
                            delete perObj.$html;
                            // debugger;
                            M.extend($scope, perObj);
                            this.setHTML(compiler.compilePect($scope));
                            if (_t) {
                                $scope.$tpl = _t;
                            }
                        };
                        host.$updateView();
                    }
                });
                mts.length = 0;
            });
            compiler.processHolder(scope, tempDiv);
            return tempDiv.get('childNodes');
        }
    };
    M.Compiler = compiler;

    function renderMtEach(scope, key, html) {
        // debugger;
        var objects = L.getObjValue(scope, key);
        var _l = objects ? objects.length : 0,
            ret = M.one(document.createDocumentFragment()),
            perObj = {
                $html: html
            };
        // debugger;
        compiler.precompile(perObj, 'v_' + scope.$getTopScope().$viewName + '_e_' + key);
        // console.count('precompile');
        M.each(objects, function(item, idx) {
            if (!L.isObject(item)) {
                item = {
                    text: item
                };
            }
            var t = M.one(document.createDocumentFragment());
            setScopeParent(item, scope);
            M.extend(item, {
                // $html: html,
                $length: _l,
                $index: idx,
                $getTopScope: function() {
                    var tscope = this;
                    while (tscope.$parent) {
                        tscope = tscope.$parent
                    }
                    return tscope;

                },
                // $attrs: $attrs,
                $parent_tpl: scope.$tpl
            });
            M.extend(item, perObj);
            compiler.render(item, t, true);
            ret.append(t);
        });
        return ret;
    }

    _drivers.mtEach = {
        fn: function(scope, host, attrs) {
            //<div mt-each="feedList"
            //each-empty 结果为空时的内容
            //each-lazy 是否是手动更新
            //></div>
            // return 'mtEach';

            var key = host.getAttr('mt-each'), //match(reg_each),
                $attrs = host.getDataValue();
            // var tpl_cacheid = scope.$getTopScope().$viewName +'_each_'+ key;
            //预编译
            var html = host.getHTML();
            host.setData('$html', html),
                stamp = M.guid();

            if (!key) {
                return '匹配不到　mt-each="key"';
            }
            var objects = M.Lang.getObjValue(scope, key);
            if (!scope.$getTopScope) {
                M.extend(scope, scopeBase);
            }
            if (!objects || !objects.length) {
                host.setData(EACH_IS_EMPTY, true);
                if (host.getAttr('each-lazy') !== 'true') {
                    host.setHTML(host.getAttr('each-empty') || M.Template.get('app.mt_each_null')({
                        text: host.getAttr('empty-text')
                    }));
                } else {
                    //TODO 增加对模板的支持
                    host.setHTML(host.getAttr('placeholder'));
                }
            } else {
                host.setData(EACH_IS_EMPTY, false);
                host.setHTML(renderMtEach(scope, key, host.getHTML()));
            }
            var field = host.getAttr('mt-each');

            if (scope.$dataSource && scope.$dataSource.bind) {
                M.each(scope.$dataSource.bind, function(api, key) {
                    if (key == field || field.indexOf(key + '.') == 0) {
                        host.setData('api', api);
                        return false;
                    }
                })
            }

            /**
             * 更新mt-each
             * @param  {type} scope [description]
             * @param  {type} cbl
             *         function(ele, res, api){...}
             * @return {type}       [description]
             */
            host.$updateView = function(scope, cbl) {
                var ele = this;
                if (ele.getData('$viewupdating')) {
                    if (ele.getData('$xpost')) {
                        ele.getData('$xpost').conn.abort();
                        ele.setData('$xpost', null);
                    }
                }
                if (!scope.$getTopScope) {
                    M.extend(scope, scopeBase);
                }
                var field = ele.getAttr('mt-each'),
                    ret = M.one(document.createDocumentFragment());
                var api = ele.getData('api');

                ele.setData('$viewupdating', true);
                if (api) {
                    var params = {};
                    M.each(api.params, function(p, n) {
                        params[n] = L.isFunction(p) ? p() : p;
                    });
                    var post = M.xPost({
                        method: api.method,
                        url: api.url,
                        data: params,
                        on: {
                            failure: function() {
                                ele.setData('$xpost', null);
                            },
                            success: function(res) {
                                ele.setData('$xpost', null);
                                api.first = api.first ? false : true;
                                if (api.fn) {
                                    api.fn(res);
                                }
                                var data = res.data;
                                M.each(api.map, function(m) {
                                    var m = m.split(':');
                                    scope[m[0]] = m[1] == '*' ? data : L.getObjValue(data, m[1] || m[0]);
                                    scope.$dataSource.bind[m[0]] = api;
                                });


                                var objects = M.Lang.getObjValue(scope, field);

                                if (cbl) {
                                    cbl(ele, res, api);
                                }
                                if (objects && objects.length) {
                                    //数据不为空, 且以前是空的, 插入节点前清空内容
                                    if (ele.getData(EACH_IS_EMPTY)) {
                                        ele.setHTML('');
                                    }
                                    ele.setData(EACH_IS_EMPTY, false)
                                    ele.append(renderMtEach(scope, field, ele.getData('$html')));
                                } else {
                                    if (!ele.get('childNodes')._nodes) {
                                        ele.setData(EACH_IS_EMPTY, true);
                                        ele.setHTML(host.getAttr('each-empty') || M.Template.get('app.mt_each_null')({
                                            text: host.getAttr('empty-text')
                                        }));
                                    }
                                }
                                ele.setData('$viewupdating', false);
                                ele.fire('$viewupdated', [api, res, ele, objects.length]);
                            }
                        }
                    });
                    ele.setData('$xpost', post);
                } else {
                    var key = ele.getAttr('mt-each'),
                        objects = M.Lang.getObjValue(scope, key);
                    if (!objects || !objects.length) {
                        ele.setData(EACH_IS_EMPTY, true);
                        if (ele.getAttr('each-lazy') !== 'true') {
                            ele.setHTML(ele.getAttr('each-empty') || M.Template.get('app.mt_each_null')({
                                text: ele.getAttr('empty-text')
                            }));
                        } else {
                            ele.setHTML('');
                        }
                    } else {
                        ele.setHTML(renderMtEach(scope, key, ele.getData('$html')));
                    }

                    ele.setData('$viewupdating', false);
                }
                //通过接口获取数据,并push到host中
            }
            return host;
        }
    };

    function setScopeParent(scope, parent) {
        scope.$parent = parent;
        parent.$supper = parent.$supper || [];
        parent.$supper.push(scope);
    }

    /*M.catalyzer = function(key, fn) {
        catalyzer[name]
    };*/

    moto.defineDriver = function(name, fn) {
        _drivers[name] = {
            fn: fn,
            tpl: M.Template(moto.getTpl('d', name))
        };
    };
});