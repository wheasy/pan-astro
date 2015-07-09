/**
 * 自动完成插件
 * @memberOf M.Plugin
 * @class Autocomplete
 * @ignore
 * @example
 * 参数
 * io 自动完成请求的地址，可为空，和source互斥
 * source 输入内容后调用的方法，可为空，和io互斥，此函数参数为输入的内容，需要返回数据
 * ioComplete 获取到数据后执行的方法
 * wrap 渲染到的节点
 * params io请求的参数，可为空
 * keyname 作为输入关键字的字段名，默认为p
 * ###HTML
 * <div>
 *     <input type="text" data-role="ac">
 * </div>
 * <div id="ac-list">
 *     
 * </div>
 * ###JS
 * //通过请求，绑定一个自动完成
 * M.role('ac').plug([{
        fn: M.Plugin.Autocomplete,
        cfg:{
            warp:'#ac-list',
            io:'/aj/xg/autocomplete.json',
            ioComplete:function(e){
                //e为返回的结果
                //do something
            }
        }
    }]);
    //为其绑定事件
    //在list显示之后出发的事件
    M.role('ac').Autocomplete.on('show',funciton(e){
        //do something
    })

    //通过数据处理函数，绑定一个自动完成
 * M.role('ac').plug([{
        fn: M.Plugin.Autocomplete,
        cfg:{
            warp:'#ac-list',
            source:function(e){
                //e为输入的内容
                var ret = ['a':1,'b':2,'c':3];
                //ret作为返回数据生成列表
                return ret;
            },
            ioComplete:function(e){
                //e为返回的结果
                //do something
            }
        }
    }]);    

 *
 * Autocomplete.on
 * 支持的事件
 * show 显示触发的事件
 * hide 隐藏触发的事件
 * enter 输入内容触发，参数为内容
 */
Mo.define('autocomplete-plugin', function(M) {
    var L = M.Lang,
        LATER_POST = 300,
        TPL_OPTIONS = '<span><a href="javascript:;" class="ac-item">{{item["text"]}}</a></span>',
        TPL_OPTIONS_ARRAY = '<span><a href="javascript:;" class="ac-item">{{text}}</a></span>';

    M.plugin('autocomplete',{
        ATTRS : {
            status: {
                value: 'slient'
            }
        },
        init: function(cfg) {
            var self = this,
                host = self.get('host');

            self.host = host;
            self.optlist = new M.OptionList({
                wrap: cfg.wrap,
                skin: (cfg.skin || '') + ' nameauto',
                targetNode: host
            });
            // if(host.get('tagName') === 'INPUT'){
            //     self.optlist.get('layer').flying.setStyles({
            //         minWidth: host.get('region').width - 2
            //     });
            // }

            self.bindEvent();
        },
        handler: {},
        bindEvent: function() {
            //绑定宿主的事件
            var self = this,
                host = self.host;

            host.on({
                // mouseup: self._listener,
                keyup: self._listener,
                change: self._listener,
                //keydown: self._keypressListener,
                blur: function() {
                    this.hide(300, 'blur');
                },
                click: function(evt) {
                    evt.halt();
                    var that = this;
                    that._activeProcess();
                }
            }, null, self);
            if (M.UA.ie === 0) {
                host.on({
                    input: self._listener
                }, null, self);
            }
        },
        /**
         * 设置input的值,可通过监控 enter,获取选中值
         */
        _setValue: function(opt) {
            var self = this;
            if (self.fire('enter', opt) === false) {
                return;
            }
            //TODO fire 没有返回程序的返回值
            self.get('host').set('value', opt.text);
            self.fire('afterEnter', opt);
            self.hide();
        },
        /**
         * 获得当前输入值
         */
        _getInput: function() {
            var self = this;
            return L.trim(self.get('getInput') ? self.get('getInput')() : self.get('host').get('value'));
        },
        _listener: function(evt) {
            var self = this;
            //取消延时
            if (evt.keyCode === 13) {
                evt.halt();
                return;
            }
            switch (evt.keyCode) {
                case 13:
                    evt.halt();
                    return;
                    break;
                case 38:
                    //press up
                    evt.halt();
                    return;
                    break;
                case 39:
                    //press right
                case 40:
                    //press down
                    evt.halt();
                    return;
                    break;
                    //shift
                case 16:
                    break;
                case 37:
                    //press left
                default:
                    self._activeProcess();
                    break;
            }
        },
        _cancelIO: function() {
            var self = this;
            //取消延时
            if (self.handler.process) {
                self.handler.process.cancel();
                delete self.handler.process;
            }
        },
        _activeProcess: function() {
            var self = this,
                oldValue = self.get('oldValue'),
                val = self._getInput();
            //TODO 在oldValue === val 且被多次触发时，cancel了。
            if (!val) {
                self.hide();
                return;
            }

            if (oldValue === val && self.get('dataLength')) {
                self.show();
                return;
            }

            self._cancelIO();
            self.set('oldValue', val);
            self.handler.process = M.later(LATER_POST, self, self._process);
        },
        _process: function() {
            var self = this,
                optlist = self.optlist,
                host = self.host,
                val = self.get('oldValue'),
                params = {};
            params[self.get('keyName') || 'q'] = val;
            optlist.set('target', self.get('target') || host);

            M.extend(params, self.get('params'));

            //如果sources一个方法，则使用该改方法
            //
            if (L.isFunction(self.get('source'))) {
                var list = self.get('source')(val);
                self._bindSource(list, val);
                return;
            }
            if (self.handler.loading) {
                self.handler.loading.cancel();
                delete self.handler.loading;
            }

            self.handler.loading = M.xPost({
                url: self.get('io'),
                data: params,
                on: {
                    success: function(res) {
                        var _process = self.get('process');
                        _process && _process(res);
                        self.set('dataLength', res.data.list ? res.data.list.length : 0);

                        if (res.data.list && res.data.list.length) {
                            self._bindSource(res.data.list);
                        } else {
                            self.hide(1);
                            return;
                        }

                    },
                    failure: function() {

                    },
                    complete: function(res) {
                        var _ioComplete = self.get('ioComplete');
                        return _ioComplete && _ioComplete(res) || res;
                    }
                }
            });
        },
        _bindSource: function(list, val) {
            var self = this,
                optlist = self.optlist;
            optlist.bindSource(self.get('tpl') || (M.Lang.isObject(list[0]) ? TPL_OPTIONS : TPL_OPTIONS_ARRAY), {
                value: val,
                list: list || []
            });
            self.show();
        },
        _highLight: function() {
            /*

            var self = this,
                optlist = self.optlist,
                val = self._getInput();

            optlist.get('optlist').body.all('.ac-item').each(function(item) {
                var c = item.getHTML();
                    item.setHTML(c.replace(val, '<span style="color:yellow;">'+val+'</span>'));
                    console.log(c.replace(val, '<span style="color:yellow;">'+val+'</span>'))
            });*/
        },
        _keypressListener: function(evt) {
            var self = this;
            switch (evt.keyCode) {
                case 13:
                    evt.halt();
                    break;
                case 38:
                    //press up
                    evt.halt();
                    break;
                case 39:
                    //press right
                    break;
                case 40:
                    //press down
                    evt.halt();
                    break;
                case 37:
                    //press left
                    break;
                default:
                    break;
            }
        },
        show: function(cfg) {

            var self = this;
            if (self.get('status') === 'show') {
                return;
            } else {
                self.set('status', 'show');
            }

            cfg = cfg || {};

            if (self.fire('show', cfg)) {
                return;
            }


            self.optlist.on('enter', function(val) {
                self._setValue(val);
            });

            self.optlist.showit();
        },
        hide: function(delay, trigger) {
            var self = this;
            if (self.fire('hide', {
                    trigger: trigger
                })) {
                return;
            }

            if (self.get('status') === 'hide') {
                return;
            } else {
                self.set('status', 'hide');
            }
            self.handler.hide = M.later(delay || 150, self, function() {
                var that = this;
                self.handler.hide = null;
                self.optlist.hideit();
            })

        }

    })

});