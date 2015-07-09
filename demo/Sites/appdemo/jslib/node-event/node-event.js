/**
 * node-event 提供基于node的事件绑定、解绑、代理、解除代理及自定义事件机制
 * 
 * 
*/
Mo.define('node-event', function (M) {
    var Lang = M.Lang,
        EVTS = "_moEvent",
        MOUSEENTER = "mouseenter",
        MOUSELEAVE = "mouseleave",
        MOUSEOVER = "mouseover",
        MOUSEOUT = "mouseout";
    /**
     * @lends M.Node.prototype
     */
    M.EventTarget = {
		/**
		 * 提供事件绑定与注册
		 * @param {string} types 事件类型
		 * @param {Function} fn 事件触发时对应的处理函数
		 * @param {Ojbect} context  事件触发时对应的this
		 * @param {Any} args  事件触发时要传递的参数
		 * @param {String} selector  支持选择器，用来匹配event.target，多用于事件代理
		 */
        on: function(types, fn, context, args, selector) {
            var orgType,self = this._node || this,k,
                capture = false,
                isNode = (Lang.isNode(self) || self === window) ? true : false;
            if( Lang.isString(types) && types.indexOf(',') !== -1){
                types = types.split(',');
            }

            if(Lang.isArray(types)) {
                for (var type in types ) {
                    this.on( types[type], fn, context, args, selector);
                }
                return this;
            }else if(Lang.isObject(types)) {
                for(var type in types){
                    this.on(type, types[type], context, args, selector);
                }
            }
            //webkit mouseenter && mouseleave 处理
            context = context || this;
            types = Lang.trim(types);
            orgType = types;
            self.evtWebkit = M.UA.webkit && (orgType == MOUSEENTER || orgType == MOUSELEAVE);
            self.evtIE = M.UA.ie ? true : false;
            if(self.evtWebkit || self.evtIE){
                types === MOUSEENTER && (types = MOUSEOVER);
                types === MOUSELEAVE && (types = MOUSEOUT);
            }

            self.isOrgEvt = isNode && (typeof self['on'+types]) === 'object' ? true : false;
            self[EVTS] = self[EVTS] || {};
            self[EVTS][types] = self[EVTS][types] || {};
            var args_arr;

            k = M.stamp(fn);
            if (!selector) {
                self[EVTS][types][k] = function(e){
                    e = e || window.event;
                    if(self.evtWebkit){
                        //webkit mouseenter && mouseleave  处理
                        var et=e.currentTarget,er=e.relatedTarget;
                        if(et.contains(er)) return false;
                    };
                    self[EVTS][types].isOrgEvt && (e = new M.Event(e, self[EVTS][types][k] && self[EVTS][types][k].currentTarget));
                    args_arr = [e];
                    if(self[EVTS][types][k] && !Lang.isUndefined(self[EVTS][types][k]._args)){
                        args_arr[Lang.isArray(self[EVTS][types][k]._args) ? 'concat' : 'push'](self[EVTS][types][k]._args);
                    }
                    return fn.apply(context, args_arr);
                };
                self[EVTS][types].isOrgEvt = self.isOrgEvt;
                self[EVTS][types][k]._args = args;
                self[EVTS][types][k].currentTarget = M.one(self);
                self[EVTS][types][k].orgType = orgType;
            }else{
                //delegate 处理
                capture = true;
                self[EVTS][types][k] = function(e, args) {
                    var e = e || window.event,
                        target = e.target || e.srcElement,
                        isTarget = false;
                    if(target.nodeType === 3) {
                        target = target.parentNode;
                    }

					do {
						if(!target) return;
						isTarget = M.Selector.test( target, selector, self);
						if( !isTarget && target !== self) {
							target = target.parentNode;
						}
                    } while (!isTarget && target !== self)

                    if ( isTarget ) {
                        args_arr = [new M.Event(e, M.one(target))];
                        if(self[EVTS][types][k]._args){
                            args_arr.push(self[EVTS][types][k]._args);
                        }
                        return fn.apply(context, args_arr);
                    }
                };
                self[EVTS][types][k]._args = args;
                self[EVTS][types][k].currentTarget = M.one(self);
                self[EVTS][types][k].orgType = orgType;
            }
            M.EventTarget._add(self, types, self[EVTS][types][k], capture);
            return this;
        },
		/**
		 * 提供事件解绑
		 *
		 * @param {string} types 事件类型
		 * @param {Function} fn  要解绑的函数，不设置则解绑所有
		 * @param {String} selector  支持选择器，用来匹配event.target，多用于事件代理解绑
		 */
        off: function(types, fn, selector) {
            var self = this._node ? this._node : this;

            if( !Lang.isString(types)) {
                return;
            } else if(types.indexOf(',') !== -1){
                types = types.split(',');
            }
            if( Lang.isArray(types)) {
                for ( var type in types ) {
                    this.off(types[type], fn, selector);
                }
                return this;
            }
            types = Lang.trim(types);
            if(!self[EVTS] || !self[EVTS][types]) return;
            var k;
            if(self.evtWebkit || self.evtIE) {
                if(types === MOUSEENTER) {
                    types = MOUSEOVER;
                }else if(types === MOUSELEAVE) {
                    types = MOUSEOUT;
                }
            }
            if(fn){
                k = fn[M.config.prefix];
                if(k && self[EVTS][types][k]) {
                    if(self[EVTS][types].isOrgEvt){
                        M.EventTarget._remove( self, types, self[EVTS][types][k], false);
                    }

                    delete self[EVTS][types][k];
                }
            }else{
                for(var k in self[EVTS][types]){
                    if(self[EVTS][types].isOrgEvt) {
                        M.EventTarget._remove( self, types, self[EVTS][types][k], false);
                    }
                }
                delete self[EVTS][types];
            }

        },
		/**
		 * 提供事件代理绑定
		 *
		 * @param {string} types  事件类型
		 * @param {Function} fn  事件触发时对应的处理函数
		 * @param {String} selector  支持选择器，用来匹配event.target
		 * @param {Ojbect} context  事件触发时对应的this
		 * @param {Any} args  事件触发时要传递的参数
		 */
        delegate: function( types, fn, selector, context, args ) {
            this.on( types, fn, context, args, selector );
        },
		/**
		 * 提供事件代理解绑
		 *
		 * @param {string} types  事件类型
		 * @param {Function} fn  事件触发时对应的处理函数，不设置解绑所有
		 * @param {String} selector  支持选择器，用来匹配event.target
		 */
        undelegate: function( types, fn, selector ) {
            this.off( types, fn, selector );
        },
		/**
		 * 手动触发事件
		 * @param {string} type  事件类型
		 * @param {Any} args  事件触发时要传递的参数
		 */
        fire: function( type, args ) {
            var self = this._node || this,
                evType;
            if(Lang.isObject(self[EVTS])){
                evType = self[EVTS][type];
                if(Lang.isObject(evType)) {
					var lastFn;
                    for(var i in evType) {
                        var fn = evType[i];
                        if(Lang.isFunction(fn)) {
							lastFn = fn && fn(args);
                        }
                    }
					return lastFn;
                }
            }
        }

    }
    /**
     * @lends M.Node.prototype
     */
    M._DOMEvent = {
        /**
         * 触发focus方法
         * @return {Object} 当前Node节点
         */
        focus: function(){
            this._node && this._node.focus();
			return this;
        },
        /**
         * 触发blur方法
         * @return {Object} 当前Node节点
         */
        blur: function(){
            this._node && this._node.blur();
			return this;
        }

    };

    M.extend(M.Node, M.EventTarget);
    M.extend(M.Node, M._DOMEvent);

    M.extend(M.EventTarget, {
        _add: function(el, type, fn, capture) {
            if (el && el.addEventListener) {
                el.addEventListener(type, fn, capture);
            } else if (el && el.attachEvent) {
                el.attachEvent('on' + type, fn);
            }
        },
        _remove: function(el, type, fn, capture) {
            if (el && el.removeEventListener) {
				el.removeEventListener(type, fn, capture);
            } else if (el && el.detachEvent) {
                el.detachEvent('on' + type, fn);
            }
        }
    });

});

