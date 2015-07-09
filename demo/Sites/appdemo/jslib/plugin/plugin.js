/**
 * @namespace M.Plugin
 * @author jiangjibing
 * @date 2013/6/26
 */

Mo.define('plugin', function(M) {

    M.namespace('Plugin');

    //实现插件主机
    var L = M.Lang,
        VALUE = 'value',
        PluginHost = function() {
            //已注册插件对象
        };
    /**
     * 插件宿主
     * @class M.PluginHost
     */
    /**
     * @lends = M.PluginHost
     */
    PluginHost.prototype = {
        /**
         * 挂载插件
         * @param  {String|M.PlugiBase} plugin 插件对象或插件名称
         * @param  {Object} config 配置
         * @return {PluginHost}         
         */
        plug: function(_Plugin, _config) {
            var ns, self = this;
            if(L.isString(_Plugin)){
                if (!M.Plugin[_Plugin]) {
                    M.log('error', '未找到插件：' + _Plugin + '  1.调用名称没错? 2.引用了该插件 3.插件JS异常？');
                    return;
                }
                _Plugin = M.Plugin[_Plugin];
            }
            self._Plugins = self._Plugins || {};

            if (L.isArray(_Plugin)) {
                M.each(_Plugin, function(_plugin) {
                    self.plug(_plugin);
                });
            } else {
                if (_Plugin && !L.isFunction(_Plugin)) {
                    _config = _Plugin.cfg;
                    _Plugin = _Plugin.fn;
                }

                // 确保插件是函数类型  插件必须有Name
                if (_Plugin && _Plugin.NS) {
                    ns = _Plugin.NS;

                    _config = _config || {};
                    _config.host = self;

                    if (self.hasPlugin(ns)) {
                        // Update config

                        if (self[ns].setter) {
                            self[ns].setter(_config);
                        }

                    } else {
                        // Create new instance
                        self[ns] = new _Plugin(_config);
                        self._Plugins[ns] = _Plugin;
                    }
                }
            }
            return self;
        },

        unplug: function(_Plugin) {
            var ns = _Plugin,
                self = this,
                Plugins = self._Plugins;
            //debugger;
            if (_Plugin) {
                if (L.isFunction(_Plugin)) {
                    ns = _Plugin.NS;
                    if (ns && (!Plugins[ns] || Plugins[ns] !== _Plugin)) {
                        ns = null;
                    }
                }

                if (ns) {
                    if (self[ns]) {
                        if (self[ns].destroy) {
                            this[ns].destroy();
                        }
                        delete self[ns];
                    }
                    if (Plugins[ns]) {
                        delete Plugins[ns];
                    }
                }
            } else {
                for (ns in self._Plugins) {
                    if (self._Plugins.hasOwnProperty(ns)) {
                        self.unplug(ns);
                    }
                }
            }
            return self;

        },

        //判断插件是否存在
        //todo this.name ns=''有否必要？
        hasPlugin: function(name) {
            return (this._Plugins[name] && this[name]);
        },

        destroyPlugins: function() {
            this.unplug();
        }
    };

    M.Plugin.Host = PluginHost;

    /**
     * 实现类似Y.Base功能，固定格式读取参数实现setter，getter
     */

    //插件
    function PluginBase() {
        //TODO  是否需要判断Plugin base已经实例化
        this._init.apply(this, arguments);
    }

    PluginBase.ATTRS = {
        // abc: {
        //     val: true,
        //     readOnly: true
        // },

        def: function() {}
    };

    PluginBase.NAME = 'plugin';

    PluginBase.NS = 'plugin';

    //为Plugin扩展一些方法
    //主要扩展事件回收和管理，设置自定义事件
    M.extend(PluginBase, M.Base, {
        _init: function(config) {
            this.initDataByAttrs();

            this.setter(config);

            this.init.apply(this, arguments);
        },
        //时间监听或AOP注入事件的列表
        _handles: null,

        //
        init: function() {
            this._handles = [];
            M.log('Old Plugin has init');

        },
        //销毁事件监听者
        destroy: function() {
            // remove all handles
            if (this._handles) {
                M.each(this._handles, function(handle) {
                    handle.detach();
                });
            }
        }
    });

    M.Plugin.Base = PluginBase;
    /**
     * 实例化插件
     * @param  {String} plugName 插件名
     * @param  {Object} cfg      插件属性，方法
     */
    M.plugin = function(plugName, cfg) {
        var plug = function() {
            plug.superclass.constructor.apply(this, arguments);
        };

        plug.NAME = cfg.NAME || plugName;
        plug.NS = cfg.NS || plugName;
        plug.ATTRS = cfg.ATTRS || {};

        M.extend(plug, M.EventTarget);
        M.extend(plug, M.Plugin.Base, cfg);

        M.Plugin[plugName] = plug;
    };
});