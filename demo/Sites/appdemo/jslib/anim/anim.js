/**
 * 动画默认只加载基础动画和Ease-in效果
 * @memberOf M
 * @class Anim
 * @author jiangjibing
 * @date 2013/6/27
 * @example
 * 参数
 * node 要执行动画的节点，支持css选择器
 * effect 动画执行的效果
 * from 动画开始时的css
 * to 动画结束时的css
 * 
 * 可监听事件
 * start 动画开始
 * end 动画结束
 * pause 动画暂停
 * tween 动画运行中
 * ###js
 *  //初始化动画
 *  var _Anim = new M.Anim({
      node: '#abc',
        //'effect': 'easing',
        'from': {
            width: '500px',
            opacity: 0
        },
        'to': {
            width: '10px',
            left: '400px',
            top: '100em',
            opacity: 1
        }
    });
    //绑定事件，支持连续写法
    _Anim.on('start',function(a){
        console.log('start')
    }).on('end',function(a) {
        console.log('end');
    }).on('pause',function(a){
        console.log('pause');
    }).run();
 */
Mo.define('anim', function(M) {
    /**
     * 提供默认动画 
     */
    M.namespace('Anim');


    var _running = {},
        _timer,
        L = M.Lang,
        MArray = M.Array,
        NUM = Number,
        START = 'start',
        TWEEN = 'tween',
        END = 'end',
        PAUSE = 'pause',
        RESUME = 'resume',
        FINISH = 'finish',
        REVERSE = 'reverse',
        ITERATION_COUNT = 'iterationCount';


    M.Anim = function(){
        //默认传入(node, options)
        this.init.apply(this, arguments);
        M.Anim._instances[M.stamp(this)] = this;
    }
	M.extend(M.Anim, M.EventTarget);

    M.Anim._instances = {};
    //Setter
    M.Anim.attrSetter = function(){

    };

    /**
     * 开始执行所有动画.
     * @example
     * ###js
     * M.Anim.run();
     */
    M.Anim.run = function() {
        var instances = M.Anim._instances,
            i;
        for (i in instances) {
            if (instances[i].run) {
                instances[i].run();
            }
        }
    };

    /**
     * 暂停所有动画
     * @example
     * ###js
     * M.Anim.pause();
     */
    M.Anim.pause = function() {
        for (var i in _running) { // stop timer if nothing running
            if (_running[i].pause) {
                _running[i].pause();
            }
        }

        M.Anim._stopTimer();
    };

    /**
     * 停止所有动画
     * @example
     * ###js
     * M.Anim.stop();
     */
    M.Anim.stop = function() {
        for (var i in _running) { // stop timer if nothing running
            if (_running[i].stop) {
                _running[i].stop();
            }
        }
        M.Anim._stopTimer();
    };

    M.Anim._startTimer = function() {
        if (!_timer) {
            _timer = setInterval(M.Anim._runFrame, M.Anim._ATTRS.intervalTime);
        }
    };

    M.Anim._stopTimer = function() {
        clearInterval(_timer);
        _timer = 0;
    };

    /**
     * Called per Interval to handle each animation frame.
     * @method _runFrame
     * @private
     * @static
     */
    M.Anim._runFrame = function() {
        var done = true,
            anim;
        for (anim in _running) {
            if (_running[anim]._runFrame) {
                done = false;
                _running[anim]._runFrame();
            }
        }

        if (done) {
            M.Anim._stopTimer();
        }
    };

    /**
     * The default setter to use when setting object properties.
     * @ignore
     * @static
     */
    M.Anim.DEFAULT_SETTER = function(anim, att, from, to, elapsed, duration, fn, unit) {
        var node = anim.node,
            domNode = node._node,
            val;

            
            _fn = fn;//(fn in effect) ? effect[fn] : effect('easing');

            val = _fn(elapsed, NUM(from), NUM(to) - NUM(from), duration)

        if (domNode) {
            if ('style' in domNode && (att in domNode.style || att in M.DOM.CUSTOM_STYLES)) {
                unit = unit || '';
                node.setStyle(att, val + unit);
            } else if ('attributes' in domNode && att in domNode.attributes) {
                node.setAttribute(att, val);
            } else if (att in domNode) {
                domNode[att] = val;
            }
        } else if (node.set) {
            node.set(att, val);
        } else if (att in node) {
            node[att] = val;
        }
    };


    //基础动画 线性动画
    M.Anim.DEFAULT_EASING = function(t, b, c, d){
        return c * t / d + b;
    };
     
    //动画基础参数
    M.Anim._ATTRS = {

        NAME: 'anim',

        //基本单位
        DEFAULT_UNIT: 'px',
        //匹配距离变化正则
        RE_DEFAULT_UNIT : /^width|height|top|right|bottom|left|margin.*|padding.*|border.*$/i,
        //匹配单位班花正则
        RE_UNITS : /^(-?\d*\.?\d*){1}(em|ex|px|in|cm|mm|pt|pc|%)*$/,


        //修复top、left的auto时无值情况
        behaviors : {
            left: {
                get: function(anim, attr) {
                    return anim._getOffset(attr);
                }
            }
        },

        intervalTime: 15,

        duration: 1

    };

    M.Anim._ATTRS.behaviors.top = M.Anim._ATTRS.behaviors.left;

    //实现基本动画
    /**
     * @lends M.Anim.prototype
     */
    var _Action = {

        init: function(){

            var args = this._ajudgeParam(arguments) || {};
            this.node = args.node;
            this.options = args.options; 

        },

        //判断参数
        _ajudgeParam: function(arg){

            var aPara = {}, node;
            if(!arg) return aPara;
            arg = arg[0];
            if(L.isObject(arg)){
                node = arg.node;
                //可以传入选择器、原生节点、Node节点
                if(L.isNode(node) || L.isString(node)){
                    aPara.node = M.one(node);
                }
                if(node._node){
                    aPara.node = node;
                }

                aPara.options = arg;
            }
            
            return aPara;
        },

        //处理初始化动画参数传入
        _initAttr: function(){
            var from = this.get('from') || {},
                to = this.get('to') || {},
                val = this.get('effect') || 'easeNone',
                dur = this.get('duration') || M.Anim._ATTRS.duration,
                attr = {
                    duration: dur * 1000,
                    effect: (L.isString(val) && M.Effect) ? M.Effect[val] : M.Anim.DEFAULT_EASING
                },
                customAttr = M.Anim._ATTRS.behaviors,
                node = this.node,
                start,end, unit,
                self = this;
            //遍历form，to 重新组装 
            /**
             * attr['width']:{
                from: 100px;
                to: 200px;
                unit: unit
             }*/


             M.each(to, function(val, name){
                //val可以是回调函数
                if(L.isFunction(val)){
                    val = val.call(this, node);
                }

                start = from[name];

                if(L.isUndefined(start)){
                    //TODO：无初始属性时获取computedStyle
                    start =  (name in customAttr && 'get' in customAttr[name]) ? customAttr[name].get(self, name) : node.getStyle(name);
                    
                }else if(L.isFunction(start)){
                    start = start.call(this, node);
                }

                //匹配值中数值和单位并分类
                var sFrom = M.Anim._ATTRS.RE_UNITS.exec(start),
                    sTo = M.Anim._ATTRS.RE_UNITS.exec(val);

                start = sFrom ? sFrom[1] : start;
                end = sTo ? sTo[1] : val;
                unit = sTo ? sTo[2] : sFrom ? sFrom[2] : '';

                if (!unit && M.Anim._ATTRS.RE_DEFAULT_UNIT.test(name)) {
                    unit = M.Anim._ATTRS.DEFAULT_UNIT;
                }

                if (!start || !end) {
                    M.log('error','Anim : ' + name + '的 "from" 或 "to" 传值无效');
                    return;
                }

                attr[name] = {
                    from: L.isObject(start) ? L.clone(start) : start,
                    to: end,
                    unit: unit
                };

             });

            //执行时属性处理赋值
            this._runtimeAttr = attr;

        },

        PAUSED : false,

        RUNNING : false,

        REVERSE : false,

        //起始时间
        START_TIME : null,

        ELAPSED_TIME : 0,

        iterationCount: 0,

        iterations: 1,

        direction: 'normal',

        /**
        * 启动动画
        * 
        */
        run: function(){
            var self = this;
            if(self.PAUSED){
                self._resume();
            }else if(!self.RUNNING){
                self._start();
            }
            return this;

        },
        /**
        * 停止动画
        *
        */
        stop: function(finish){
            if (this.RUNNING || this.PAUSED) {
                this._end(finish);
            }
            return this;
        },
        /**
        * 暂停动画
        *
        */
        pause: function(){
            if (this.RUNNING) {
                this._pause();
            }
            return this;
        },
        
        
        _start: function(){
            var self = this;
            self.START_TIME = new Date() - this.ELAPSED_TIME;
            self._actualFrames = 0;
            if(!self.PAUSED){
                //准备动画参数
                self._initAttr();
            }

            _running[M.stamp(this)] = this;

            M.Anim._startTimer();

            //bind custom
            self.fire(START,self);
        },

        _resume: function(){
            var self = this;
            self.PAUSED = false;
            _running[M.stamp(self)] = self;
            self.START_TIME = new Date() - self.ELAPSED_TIME;
            M.Anim._startTimer();
        },

        _pause: function(){
            var self = this;
            self.START_TIME = null;
            self.PAUSED = true;
            delete _running[M.stamp(self)];
			self.fire(PAUSE, self);
        },

        _end: function(finish){
            var self = this,
                attr = self._runtimeAttr,
                duration = attr.duration * 1000;
            if (finish) { // jump to last frame
                this._runAttrs(duration, duration, self.REVERSE);
            }

            self.START_TIME = null;
            self.ELAPSED_TIME = 0;
            self.PAUSED = false;

            delete _running[M.stamp(this)];

            self.fire(END, {elapsed: self.ELAPSED_TIME});

        },

        _runFrame: function(){
            var self = this,
                d = self._runtimeAttr.duration,
                t = new Date() - self.START_TIME,
                reverse = self.REVERSE,
                done = (t >= d);
            self._runAttrs(t, d, reverse);
            self._actualFrames += 1;
            self.ELAPSED_TIME = t;
            self.RUNNING = true;
           
            self.fire(TWEEN, self);
            if (done) {
                self._lastFrame();
                self.fire(FINISH, self);
                //self.RUNNING = false;
            }
        },

        _runAttrs: function(t, d, reverse){
            var self = this,
                attr = self._runtimeAttr,
                customAttr = M.Anim._ATTRS.behaviors,
                effect = attr.effect,
                lastFrame = d,
                done = false,
                attribute,
                setter,
                i;
                //console.log(attr.effect)
            if (t >= d) {
                done = true;
            }

            if (reverse) {
                t = d - t;
                lastFrame = 0;
            }

            for (i in attr) {
                if(!attr[i])return;
                if (attr[i].to) {
                    attribute = attr[i];
                    setter = (i in customAttr && 'set' in customAttr[i]) ?
                            customAttr[i].set : M.Anim.DEFAULT_SETTER;

                    if (!done) {
                        setter(this, i, attribute.from, attribute.to, t, d, effect, attribute.unit);
                    } else {
                        setter(this, i, attribute.from, attribute.to, lastFrame, d, effect, attribute.unit);
                    }
                }
            }
        },

        _lastFrame: function(){
            //this.RUNNING = false;
            var self = this,
                iter = self.iterations,
                iterCount = self.iterationCount;

            iterCount += 1;
            if (iter === 'infinite' || iterCount < iter) {
                if (self.direction === 'alternate') {

                    self.REVERSE = !self.REVERSE; // flip it
                }
                /**
                * @event iteration
                * @description fires when an animation begins an iteration.
                * @param {Event} ev The iteration event.
                * @type Event.Custom
                */
                self.fire('iteration');
            } else {
                iterCount = 0;
                this._end();
            }

            self.START_TIME = new Date();
            self.ITERATION_COUNT = iterCount;
        },

        set: function(){
            var args = arguments,
                _arg = args[0];
            if(L.isObject(_arg)){
                this.options = M.merge(this.options, _arg);
            }
            if(args.length === 2){
                this.options[_arg] = args[1];
            }
            //this.options
        },

        get: function(item){
            return this.options[item];
        },


        //为防止出现auto属性，通过获取offset来实现
        _getOffset: function(attr) {
            var node = this.node,
                val = node.getStyle(attr),
                get = (attr === 'left') ? 'getX': 'getY',
                set = (attr === 'left') ? 'setX': 'setY',
                position;

            if (val === 'auto') {
                position = node.getStyle('position');
                if (position === 'absolute' || position === 'fixed') {
                    val = node[get]();
                    node[set](val);
                } else {
                    val = 0;
                }
            }
            return val;
        },

        /** 
         * 销毁实例化的动画对象
         * @method destructor
         * 
         */
        destructor: function(){
            delete M.Anim._instances[M.stamp(this)];
        }
        
        
    }

    M.extend(M.Anim, _Action);


});
