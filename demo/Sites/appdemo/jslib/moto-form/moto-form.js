Mo.define('moto-form', function(M) {
    var DOM_FOMR_LOADING = M.role('form-loading');
    /**
     * @module Moto
     * @class M.Plugin.Form
     * @classdesc 用于单页App的表单验证插件
     * ##使用方法
     * @example <option>HTML</option>
     * ```
<div mt-plugin="form" plugin-index="login-mobile" plugin-attrs="url=/Account/LoginByPhone" data-role="tel-form">
    <div mt-plugin="form" plugin-index="login" plugin-attrs="url=/Account/Login" data-role="account-form" style="display:none;">
        <div class="form-group">
            <div class="form-item search-box">
                <label for="username"><i class="m-icon i-user"></i></label>
                <input type="text" id="username" class="m-ipt ipt-search" form-element="emailormobile" name="emailOrPhone" tips="请输入正确的手机号/邮箱" label="手机号\邮箱" placeholder="请输入手机号/邮箱" />
            </div>
        </div>
        <div class="form-group">
            <div class="form-item search-box">
               <label for="password"><i class="m-icon i-unlock"></i></label>
               <input type="password" id="password" class="m-ipt ipt-search" form-element="text" range="1,100" name="password" label="密码" tips="密码输入有误，请重新输入" placeholder="请输入密码" />
            </div>
        </div>
        <input type="hidden" form-element="hidden" name="remember" value="false">
        <div class="form-group">
            <div class="form-item">
                <button mt-button="m-btn btn-define-m" form-button="submit" mt-disabled="true"/>登    录</button>
            </div>
            <div class="form-item login-tips" >
                <a href="#" mt-href='/user/password-find'>忘记密码?</a>
                <p>无需注册，直接使用手机快捷登录</p>
            </div>
        </div>
    </div>
</div>
     * ```
     * @example <option>JS</option>
     *```
//$pluginCfg属性是视图中所有插件的设置集合，可通过plugin-index设置的key来设置插件参数。
scope.$pluginCfg['login'] = {
    success: function(res, instancForm) {
        //登陆成功后跳转到首页
        scope.get('app').router.redirect('/');
    }
};
    * ```
     */
    
    M.plugin('form', /** @lends M.Plugin.Form.prototype */{
        attrs: {
            regs: {
                account: /^(\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+|1[3|5|8]\d{9})$/,
                email: /^(\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+)$/,
                mobile: /^1\d{10}$/,
                emailormobile: /^(\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+)$|^1[3|5|8|7]\d{9}$/,
                mobileortel: /^((\d{3}-\d{8})|(\d{4}-\d{7}))$|^((13|14|15|18|17){1}[0-9]{9})$/,
                number: '^\\drange$',
                words: '^[\\u4e00-\\u9fa5a-z0-9\\_\\-]range$', //需要制定一个长度，默认 {2,20} 字符
                text: '^\[\\s\\S]range$', //默认文本
                nickname: /^[\u4e00-\u9fa5a-zA-Z0-9\_\-]{2,20}$/,
                zipcode: /^[1-9]\d{5}(?!\d)$/,
                password: /^[\@A-Za-z0-9\!\#\$\%\^\&\*\.\~\(\)\<\>\:\;\"\'\\\[\]\{\}\`]{6,24}$/
            },
            //常用判断类型
            DefaultTypes: 'text,mobile,email,account,nickname,words,password,hidden,number,custom,mobileortel,zipcode,emailormobile'.split(',')
        },
        events: {

        },
        //需求：
        //1. 输入过程中校验单项是否通过，通过后点亮button  2. 多项表单需要在button点击提交时做校验，单线验证
        //默认验证规则定义类型“手机(mobile)、邮箱(email)、账号(account)、字符文本(text)、密码（password）、隐藏域（hidden）

        /**
         * 表单验证
         * @constructor form
         * @example
         * //plugin-attrs 配置项
         * <div mt-plugin="form" plugin-index="addrsave" plugin-attrs="url=/Address/SaveCustomerAddress">
         *      ......
         * </div>
         *
         * scope.$pluginCfg['addrsave'] = {
         *      beforeStart: function(obj) {
         *          //...
         *      },
         *      success: function(res, instancForm) {
         *          //...
         *      }
         * };
         *
         * //form-element验证类型 tips错误提示 
         * <input type="tel" form-element="mobile" name="telephone" label="联系人手机号" placeholder="联系人手机号" tips="请输入正确的手机号码" />
         *
         * //form-button="submit"提交按钮  mt-disabled="true" 按钮是否可点
         * <button type="submit" mt-button="m-btn btn-define-m" form-button="submit" mt-disabled="true"/>保      存</button>
         *
        */
        init: function(cfg) {
            //需要有值输入才点亮button
            var self = this;
            var scope = self.get('scope');
            var ele = self.get('host');
            self.scope = scope;
            self.ele = ele;
            //var Attrs = this.attrs;
            self.elements = ele.all('[form-element]');
            //temporate

            self.btn = ele.one('[form-button=submit]');
            if(self.btn.enable){
                console.log('warn', '表单提交按钮[form-button=submit] 不是mt-botto对象');
                return;
            }
            //获取表单配置
            // self.config = M.Lang.getDataValue(ele.getAttr('plugin-attrs'));
            self.initFormElements();
            self._bindEvent();
            self.config = cfg;
        },
        /**
         * 初始化表单元素
         * @private
         */
        initFormElements: function() {
            var self = this,
                item = {},
                name;

            self.FormValue = {};
            //准备表单验证数据
            self.elements.each(function(el, index) {
                _name = el.getAttr('name');
                item[_name] = {};
                item[_name]['node'] = el;
                item[_name]['type'] = el.getAttr('form-element');
                item[_name]['rule'] = el.getAttr('rule');
                item[_name]['label'] = el.getAttr('label');
                item[_name]['value'] = el.get('value');
                item[_name]['bind'] = el.getAttr('bind');
                item[_name]['tips'] = el.getAttr('tips');
                item[_name]['required'] = M.Lang.isUndefined(el.getAttr('form-required')) ? true : false;

                //如果是隐藏输入框，当他存在绑定时，触发绑定
                if (item[_name]['type'] === 'hidden' && item[_name]['bind']) {
                    self.scope.$on('loaded', function() {
                        self.scope[el.getAttr('bind')].apply(this, [el]);
                    });
                    return;
                }

                //按钮如果默认被禁用启动键入内容匹配
                if (self.btn.getAttr('mt-disabled')) {
                    if (item[_name]['type'] === 'hidden' && item[_name]['bind']) return;
                    /* el.on('keyup',function(){
                    //M.log(self.checkAllInputFull())
                    if(self.checkAllInputFull()){
                        self.btn.enable();//setAttr('mt-disabled',true);
                    }else{
                        self.btn.disable();
                    }
                });*/
                    el.on('input', function() {
                        //M.log(self.checkAllInputFull())
                        if (self.checkAllInputFull()) {
                            self.btn.enable(); //setAttr('mt-disabled',true);
                        } else {
                            self.btn.disable();
                        }
                    });
                }

                //文本输入区域倒计数处理
                if (el.getAttr('text-count')) {
                    var _textcount = self.ele.role('text-count'),
                        _totalNum = Number(el.getAttr('range').split(',')[1]),
                        _compute,
                        _result;
                    el.on('input', function() {
                        _compute = el.get('value').length;
                        if (_compute <= _totalNum) {
                            // _result = _totalNum - _compute;
                            _textcount.removeClass('num-warning');
                        } else {
                            // _result = _compute;
                            _textcount.addClass('num-warning');
                        }
                        _result = _totalNum - _compute;
                        _textcount.setHTML(_result);
                    });
                }


            });

            self.ITEMS = item;

            //按钮的初始化操作
            //按钮如果需要被刺激点亮时需要检查内容是否存在
            //isRequireValue
            //M.Button(self.btn,{})

            //self.isRequireValue = self.btn.getAttr('isRequireValue');

        },
        /**
         * 检查是否需要所有表单项不为空
         * @private
         */
        checkAllInputFull: function() {
            var self = this,
                _mark = true,
                _val;
            self.elements.each(function(item) {
                _val = item.get('value');
                if (M.Lang.isUndefined(_val)) {
                    _val = '';
                }
                if (_val.length === 0 && item.getAttr('form-element') !== 'hidden' && item.getAttr('ennull') !== '1') {
                    _mark = false;
                    return false;
                }
            });
            return _mark;
        },

        /**
         * 检查规则
         * @param  {Object}  item    验证规则
         * @param  {String}  name    表单项名称
         * @param  {Boolean} isAlert 验证失败，是否显示提示
         * @return {Boolean}         是否通过验证
         */
        checkItem: function(item, name, isAlert) {
            var self = this,
                isAlert = isAlert != false,
                arrayTypes = self.attrs.DefaultTypes,
                regRexs = self.attrs.regs,
                _iType = item['type'],
                _iRule = item['rule'],
                _iValue = item['node'].get('value'),
                _iLabel = item['label'],
                _iRequired = item['required'],
                _tips = item['tips'],
                _iRange = item['node'].getAttr('range'),
                _str_range = _iRange ? '{' + _iRange + '}' : '*',
                itemRegRex;

            //去除空白
            _iValue = M.Lang.trim(_iValue);

            //全局赋值
            if (name === 'images') {
                var k = [];
                k.push(_iValue);
                _iValue = k;
            }

            self.FormValue[name] = _iValue;

            //先检查是否有输入
            if (_iValue.length === 0 && item['node'].getAttr('ennull') !== '1') {
                if (_iRequired) {
                    self.showMsg(_iLabel + ' can not be empty!', 'warn');
                    return false;
                }
                //如果非必填，不验证为空
            }
            //非必填为空不验
            if (item['node'].getAttr('ennull') === '1' && _iValue.length === 0) {
                return true;
            }
            //如果类型不存在默认为非空字符
            if (!M.Array.inArray(_iType, arrayTypes)) _iType = 'text';
            //如果是自定义正则
            if (_iType === 'custom') {
                itemRegRex = item['node'].getAttr('rule');
            } else {
                itemRegRex = regRexs[_iType];
            }

            if (M.Lang.isString(itemRegRex)) {
                itemRegRex = new RegExp(itemRegRex.replace(/range/ig, _str_range));
            }
            if (M.Lang.isUndefined(itemRegRex)) {
                if (_iType === 'hidden') {
                    return true;
                } else {
                    return false;
                }
            }

            //满足正则条件
            itemRegRex = new RegExp(itemRegRex);
            if (itemRegRex.test(_iValue)) {
                return true;
            } else if (isAlert) {
                if (_tips) {
                    self.showMsg(_tips, 'warn');
                    return false;
                }
                if (_iLabel) self.showMsg(_iLabel + ' format error !', 'warn');
                return false;
            } else {
                return false;
            }
        },
        /**
         * 检查全部表单项，通过则提交表单
         */
        checkAll: function() {
            var self = this,
                _mark = [];
            for (var item in self.ITEMS) {
                //判断只要出错立即停止检查
                if (!self.checkItem(self.ITEMS[item], item)) {
                    _mark.push('');
                    return false;
                }
            }

            //否则开始提交
            if (_mark.length === 0) self._postForm();
        },
        /**
         * 获取表单值，如表不能全部通过表单验证，则返回false
         * @return {Object|False}
         */
        getValues: function() {
            var self = this,
                _mark = [];
            for (var item in self.ITEMS) {
                //判断只要出错立即停止检查
                if (!self.checkItem(self.ITEMS[item], item, false)) {
                    _mark.push('');
                    return false;
                }
            }
            return self.FormValue;
        },
        /**
         * 绑定相关事件
         * @private
         */
        _bindEvent: function() {
            var self = this;
            self.btn.on('click', function(e) {
                e.halt();
                self.checkAll();
            });
        },
        /**
         * 显示表单消息
         * @param  {String} msg 消息内容
         * @param  {String} [type] 消息类型
         */
        showMsg: function(msg, type) {
            //M.log((type || 'info') + ': ' + msg);
            Mt.alert(msg);
            // M.Toast(msg, true);
            /*
        this.popLayer = M.PopLayer({
            width : 300,
            hasClose : true,
            content : msg,
            type : type,
            seconds : true
        });
        this.popLayer.show();
        */
        },
        /**
         * 准备数据提交
         * @private
         */
        _postForm: function() {
            var self = this,
                empty = function() {},
                cfg = self.config || {};
            //提交之前
            if (cfg.beforeStart) {
                if (cfg.beforeStart(self) === true) {
                    self.postForm();
                }
            } else {
                self.postForm();
            }
        },
        /**
         * 提交表单
         */
        postForm: function() {
            var self = this,
                L = M.Lang,
                empty = function() {},
                cfg = self.config || {},
                data = M.merge({}, cfg.params, self.FormValue),
                url = (L.isFunction(cfg.url) ? cfg.url() : cfg.url) || self.config.url;
            if (self.btn && self.btn.get('disabled') == true) {
                return;
            }
            self.btn.disable();
            // console.log(self.config);
            //决定使用iframe提交还是ajax提交
            DOM_FOMR_LOADING && DOM_FOMR_LOADING.show();
            if (self.config.type === 'iframe') {
                M.io.Iframe({
                    url: url,
                    form: (self.ele.get('tagName') === 'FORM') ? self.ele : null,
                    method: self.config.method || 'POST',
                    target: 'iframe',
                    params: data,
                    start: function(res) {
                        //self.showMsg('正在提交', 'loading');
                        // self.btn.disable();
                        if (cfg.start) cfg.start(res, self);
                    },
                    success: function(res) {
                        //self.showMsg(res.msg,'success');
                        DOM_FOMR_LOADING && DOM_FOMR_LOADING.hide();
                        if (cfg.success) cfg.success(res, self);
                        //self.btn.enable();
                    }
                });
            } else {
                M.xPost({
                    url: url,
                    method: self.config.method || 'POST',
                    jsonData: data,
                    on: {
                        start: function(res) {
                            //self.showMsg('正在提交','loading');
                            // M.Toast('正在提交');
                            self.btn.disable();
                            if (cfg.start) cfg.start(res, self);
                        },
                        success: function(res) {
                            // M.Close(); //close Toast
                            //self.showMsg(res.msg,'success');
                            DOM_FOMR_LOADING && DOM_FOMR_LOADING.hide();
                            if (cfg.success) {
                                cfg.success(res, self);
                            } else {
                                M.log(cfg);
                            }
                            self.btn.enable();
                        },
                        failure: function(res) {
                            DOM_FOMR_LOADING && DOM_FOMR_LOADING.hide();

                            if (cfg.failure) {
                                cfg.failure(res, self);
                            } else {
                                Mt.alert(res.Message);
                            }
                            self.btn.enable();
                        }
                    }
                });
            }
        }
    });
})