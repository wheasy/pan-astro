Mo.define('xpost', function(M) {
    /**
     * 请求选项
     * @typedef {Object} M~xpostOption
     * @property {string}  url    接口地址
     * @property {object}  data   发送的数据结构，value支持function，如data = {name:function(){return 'tck'};}
     * @property {object}  jsonData   发送json格式数据结构
     * @property {string}  [method='get'] 传输方式get或post
     * @property {object}  on    回调的方法
     * @property {M.xpostSuccess} on.success 成功回调函数
     * @property {M.xpostFailure} on.failure 失败回调函数     
     */

    var L = M.Lang;
    var DEAFULT_CFG = {
        // url
        // type
        dataType: 'json',
        method: 'get',
        on: {
            // start: function(){},
            // // 请求完成后执行的回调
            // success: function(){},
            // // 请求失败时执行的回调
            // failure: function(){}
        }
    };
    if (window.$isdebug) {
        var _debug_api_per
        if (/\:\d+\/(\d+)/.test(location.href)) {
            _debug_api_per = location.href.match(/\:\d+\/(\d+)/)[1];
        }
    }
    /** @lends M */
    /**
     * @callback M.xpostSuccess
     * @param {object} res 成功结果
     * @param {object} cfg 发送的对象
     */
    /**
     * @callback M.xpostFailure
     * @param {object} res 失败结果
     * @param {object} cfg 发送的对象
     */

    /**
     * 发送异步请求（支持jsonp）
     * @static
     * @example
     * M.xPost({
     *       url:'api地址',
     *       method:'POST',
     *       data:{
     *           aid: aId,  //必选
     *       },
     *       //支持jsonData
     *       //jsonData:{
     *       //    aid: aId,  //必选
     *       //},
     *       on:{
     *           success:function(res) {
     *               //console.log(res);return
     *
     *           },
     *           failure: function(res2) {
     *               //console.log(res);return
     *           }
     *       }
     *   });
     *
     * @param {M~xpostOption} option   所需要的参数对象
     *
     */
    M.xPost = function(cfg) {
        if (!cfg.url) {
            throw new Error('参数 url 未赋值 in xpost');
        }
        cfg = M.merge({}, DEAFULT_CFG, cfg);
        if (!cfg.data) {
            if (cfg.params) {
                M.log('error', 'xpost: cfg.data is in cfg.params');
                cfg.data = cfg.params;
            } else {
                M.log('warn', 'xpost: cfg.data is null');
                cfg.data = {
                    _: ''
                };
            }
        }

        //执行fn
        var fdata = {};
        M.each(cfg.data, function(p, n) {
            fdata[n] = L.isFunction(p) ? p() : p;
        });

        //TODO 跨域的话，就调用xdr
        // if (cfg.method.toLowerCase() == 'post') {
        //     return M.io.Xdr(cfg);
        // }
        // debugger;
        if (window.$isdebug && cfg.url.indexOf('http') != 0) {

            cfg.url = (_debug_api_per ? '/' + _debug_api_per : '') + '/d_api/tuan' + cfg.url;
        }
        var host = M.Lang.getUrlHost(cfg.url);
        var isCross = host.host !== M.config.win.location.host;
        if (isCross) {
            M.jsonp(cfg);
            return;
        }
        return M.xio({
            url: cfg.url,
            data: fdata, //执行fn之后的data
            method: cfg.method || 'get',
            jsonData: cfg.jsonData,
            start: function(e) {
                cfg.on.start && cfg.on.start(e);
            },
            complete: function(res) {
                if (cfg.on && cfg.on.complete) {
                    cfg.on.complete(res, cfg);
                }
            },
            //传递参数
            //timeout:3000,//请求超时时间设置
            success: function(response) {
                //请求成功调用
                try {
                    var _data = JSON.parse(response.responseText);
                } catch (error) {
                    if (cfg.on.failure) {
                        cfg.on.failure(_data, cfg);
                    } else {
                        M.log('error', M.Lang.isUndefined(_data) ? "xpost-->>服务器返回数据错误！" : _data.msg);
                    }
                    return;
                }
                switch (_data.code) {
                    // 请求成功
                    case 1:
                    case '1':
                        cfg.on.success && cfg.on.success(_data, cfg);
                        break;
                    default:
                        if (cfg.on.failure) {
                            cfg.on.failure(_data, cfg);
                        } else {
                            if (_data.code == 6) {
                                // alert('需要登录')
                                location.href = $appCfg.LoginIndex + '?returnUrl=' + _data.msg;
                            } else {
                                Mt.alert(_data.msg);
                            }
                        }
                }
            },
            failure: function(response) {
                //请求失败调用
                try {
                    var _data = JSON.parse(response.responseText);
                    // if (_data.code == 4000002 && !cfg.ignoreLogin && M.DialogLogin) {
                    //     M.DialogLogin();
                    // }
                    if (cfg.on.failure) {
                        cfg.on.failure(_data, cfg);
                    } else {
                        M.log('error', _data.msg);
                    }
                } catch (eee) {
                    if (response.statusText == "transaction aborted") {
                        if (cfg.on.failure) {
                            cfg.on.failure({
                                code: -1,
                                msg: '请求超时'
                            }, cfg);
                        } else {
                            // Mt.alert("服务器请求超时！");
                        }
                    } else {
                        if (cfg.on.failure) {
                            cfg.on.failure({
                                code: -1,
                                msg: 'Network anomalies！'
                            }, cfg);
                        } else {
                            Mt.alert("Network anomalies！");
                        }

                        // M.log('error', 'xpost_error:' + eee);
                    }
                }
                //console.log('warn : '+'IO failure...');
                //if (response.status == 404) {
                //  M.log(response.statusText);
                //  }
            }
        });

    };
})