/**
 *Switchable 实现tabView，switchable，carousel
 *@memberOf M.Plugin
 *@class Switchable
 *@example
 * ele.role('slider').plug([{
        fn: M.Plugin.Switchable,
        cfg: {
            autoplay: false,
            pauseOnHover: true,
            interval: 2,
            circle: true,
            touch: true,
            navCls: 'slider-nav',
            contentCls: 'slider-img',
            activeTriggerCls: 'on',
            viewSize: [width, height]
        }
    }
 */
Mo.define('switchable-plugin', function(M) {
    M.namespace('Plugin');

    var doc = document;
    var DOT = '.';
    var EVENT_BEFORE_SWITCH = 'beforeSwitch';
    var EVENT_SWITCH = 'switch';
    var EVENT_AFTER_SWITCH = 'afterSwitch';
    var CLASSPREFIX = 'moui-switchable-';
    var DISPLAY = 'display';
    var BLOCK = 'block';
    var NONE = 'none';

    var DefaultAttrs = {
        /**
         * @cfg Number type
         * 默认为0。
         
         * type为default，则通过navCls和contentCls来获取triggers和panels；
         
         * type为accordion，则通过triggerCls和panelCls来获取triggers和panels；
         */
        type: 'default',
        /**
         * @cfg String navCls
         * 默认为moui-switchable-nav，通过此类获取触发条件的容器，比如1 2 3 4 5的列表，这个class应该设置到ul或者ol上面，而不是每个触发条件li上面。
         */
        navCls: CLASSPREFIX + 'nav',

        /**
         * @cfg String contentCls
         * 默认为moui-switchable-content，通过此类获取显示内容的容器，但不是具体的内容面板。
         */
        contentCls: CLASSPREFIX + 'content',

        /**
         * @cfg Boolean hasTriggers
         * 默认为true，是否有可见的触发条件。
         */
        hasTriggers: true,

        /**
         * @cfg Number activeIndex
         * 默认为0，初始时被激活的索引。
         */
        activeIndex: 0,

        /**
         * @cfg String activeTriggerCls
         * 默认为active，被激活时的css样式名。
         */
        activeTriggerCls: 'active',

        /**
         * @cfg Array events
         * 默认为['click', 'hover']，触发条件事件响应数组，目前支持click和hover。
         */
        triggerType: 'click',

        /**
         * @cfg Number step
         * 默认为1，一次切换的内容面板数。
         */
        step: 1,

        /**
         * @cfg Number delay
         * 默认为.1，延迟执行切换的时间间隔。
         */
        delay: 0.3,

        /**
         * @cfg Boolean autoplay
         * 默认为false，不自动播放。
         */
        autoplay: false,
        /**
         * @cfg Number interval
         * 默认为3S。
         */
        interval: 3,
        /**
         * @cfg Boolean circle
         * 默认为false,即不循环播放。
         */
        circle: false,
        /**
         * @cfg Array viewSize
         * 一般自动设置，除非自己需要控制显示内容面板的[宽, 高]，如果[680]、[320, 150]。
         */
        viewSize: [],
        /**
         * @cfg Boolean touch
         * 是否支持touch
         */
        touch: false
    }

    M.plugin('Switchable', /** *@lends M.Plugin.Switchable*/{
        /**
         * 初始化
         * @param  {Object} config 配置项

         * @param {Number} [config.type=0]
         * 默认为0。
         
         * type为default，则通过navCls和contentCls来获取triggers和panels；
         
         * type为accordion，则通过triggerCls和panelCls来获取triggers和panels；

         * @param {String} [config.navCls]
         * 默认为moui-switchable-nav，通过此类获取触发条件的容器，比如1 2 3 4 5的列表，这个class应该设置到ul或者ol上面，而不是每个触发条件li上面。

         * @param {String} [config.contentCls]
         * 默认为moui-switchable-content，通过此类获取显示内容的容器，但不是具体的内容面板。

         * @param {Boolean} [config.hasTriggers]
         * 默认为true，是否有可见的触发条件。

         * @param {Number} [config.activeIndex]
         * 默认为0，初始时被激活的索引。
 
         * @param {String} [config.activeTriggerCls]
         * 默认为active，被激活时的css样式名。

         * @param {Array} [config.events]
         * 默认为['click', 'hover']，触发条件事件响应数组，目前支持click和hover。
 
         * @param {Number} [config.step]
         * 默认为1，一次切换的内容面板数。

         * @param {Number} [config.delay]
         * 默认为.1，延迟执行切换的时间间隔。

         * @param {Boolean} [config.autoplay]
         * 默认为false，不自动播放。

         * @param {Number} [config.interval]
         * 默认为3S。

         * @param {Boolean} [config.circle]
         * 默认为false,即不循环播放。

         * @param {Array} [config.viewSize]
         * 一般自动设置，除非自己需要控制显示内容面板的[宽, 高]，如果[680]、[320, 150]。
         * @param {Boolean} [config.touch]
         * 是否支持touch
         */

        init: function(config) {
            var config = config ? M.merge(DefaultAttrs, config) : {};
            config.node = config.host;
            var self = this;
            self.config = config;

            self.activeIndex = config.activeIndex;

            self._parseStructure();
            if (self.viewLength != 1) {
                config.node.all(DOT + config.navCls).show();
                if (config.hasTriggers) self._bindTriggers();
                if (config.touch) self._bingTouch();
                self._autoPlay();
            } else {
                //config.node.all(DOT + config.navCls).setStyle('display', 'none');
            }



        },
        _parseStructure: function() {
            var self = this,
                config = self.config,
                container = config.node;

            switch (config.type) {
                case 'default':
                    self.triggers = self.config.hasTriggers ? container.one(DOT + config.navCls).get('children') : null;
                    self.panels = container.one(DOT + config.contentCls).get('children');
                    break;

                case 'accordion':
                    self.triggers = container.all(DOT + config.navCls);
                    self.panels = container.all(DOT + config.contentCls);
                    break;
            }
            self.viewLength = self.panels.size() / config.step;
        },

        _bindTriggers: function() {
            var self = this,
                config = self.config,
                triggers = self.triggers,
                triggerType = config.triggerType;
            triggerType = triggerType === 'hover' ? 'mouseover' : triggerType;
            triggers.each(function(trigger, index) {
                trigger.on(triggerType, function(evt) {

                    if (self.autoplayTimer) {

                        clearInterval(self.autoplayTimer);
                    }
                    evt.halt();
                    if (self.activeIndex === index) return self;
                    if (self.switchTimer) clearTimeout(self.switchTimer);
                    self.switchTimer = setTimeout(function() {
                        self.switchTo(index);
                        self._startPlay();
                    }, config.delay * 1000);

                    evt.stopPropagation();
                });

            });

        },
        _bingTouch: function() {
            var self = this,
                config = self.config;
            if (config.node && config.touch) {
                config.node.touch('flick', function(evt, data) {
                    switch (data['direction']) {
                        case 'left':
                            self.next();
                            evt.stopPropagation();
                            break;
                        case 'right':
                            self.prev();
                            evt.stopPropagation();
                            break;
                    };

                }).touch('swipe', function(evt, data) {
                    if (data['direction'] == 'left' || data['direction'] == 'right') {
                        clearInterval(self.autoplayTimer)
                        self.offset(data['x']);
                    }
                    if (data['status'] == 'end') {
                        self.end(data['x']);
                    }
                });
            }
        },
        /**
          @method switchTo
          @param index {Number} 切换到某个视图的索引值
         */
        switchTo: function(index, direction) {
            var self = this,
                config = self.config,
                triggers = self.triggers,
                panels = self.panels,
                panelsArray = M.Array.toArray(panels._nodes),
                activeIndex = self.activeIndex,
                step = config.step,
                fromIndex = activeIndex * step,
                toIndex = index * step;

            if (self.viewLength === 1) return;

            self.fire(EVENT_BEFORE_SWITCH, {
                index: index,
                fromIndex: fromIndex,
                toIndex: toIndex,
                direction:direction
            });

            if (config.hasTriggers) {
                self._switchTrigger(activeIndex > -1 ? triggers.item(activeIndex) : null, triggers.item(index));
            }
            self._switchView(
                panelsArray.slice(fromIndex, fromIndex + step),
                panelsArray.slice(toIndex, toIndex + step),
                index, direction);

            // update activeIndex
            self.activeIndex = index;

            self.fire(EVENT_AFTER_SWITCH, {
                index: index
            });
        },
        /**
         切换到上一个试图
         @method prev 
         */
        prev: function() {
            var self = this,
                activeIndex = self.activeIndex;
            if (self.autoplayTimer) {
                clearInterval(self.autoplayTimer);
            }

            self.switchTo(activeIndex > 0 ? activeIndex - 1 : self.viewLength - 1, 'prev');
            self._startPlay();
        },
        /**
         复位
         @method prev 
         */
        rest: function() {
            var self = this,
                activeIndex = self.activeIndex;
            if (self.autoplayTimer) {
                clearInterval(self.autoplayTimer);
            }
            self.switchTo(activeIndex);
            self._startPlay();
        },
        /**
         切换到下一个试图
         @method next 
         */
        next: function() {
            var self = this,
                activeIndex = self.activeIndex;
            if (self.autoplayTimer) {
                clearInterval(self.autoplayTimer);
            }
            self.switchTo(activeIndex < self.viewLength - 1 ? activeIndex + 1 : 0 /*, FORWARD*/ , 'next');
            self._startPlay();
        },

        _switchTrigger: function(fromTrigger, toTrigger) {

            var activeTriggerCls = this.config.activeTriggerCls;

            fromTrigger && fromTrigger.removeClass(activeTriggerCls);
            toTrigger.addClass(activeTriggerCls);
        },

        _switchView: function(fromPanels, toPanels, index) {
            // 最简单的切换效果：直接隐藏/显示
            M.each(fromPanels, function(n, i) {
                M.one(n).setStyle(DISPLAY, NONE);
            });
            M.each(toPanels, function(n, i) {
                M.one(n).setStyle(DISPLAY, '');
            });
        },
        _autoPlay: function() {
            var self = this,
                config = self.config,
                container = config.node;
            if (!config.autoplay) return;
            // 鼠标悬停，停止自动播放
            if (config.pauseOnHover) {

                container.on('mouseenter', function(evt) {
                    //self.paused = true;
                    if (self.autoplayTimer) {
                        clearInterval(self.autoplayTimer);
                    }
                }).on('mouseleave', function(evt) {
                    if (evt.currentTarget !== evt.target &&
                        !container.contains(evt.target)) return;
                    // 鼠标离开重新计时
                    self._startPlay();

                });
            }
            self._startPlay();

        },
        _startPlay: function() {
            var self = this,
                config = self.config;
            if(!config.autoplay){
                return;
            }
            if (self.autoplayTimer) {
                clearInterval(self.autoplayTimer);
            }
            self.autoplayTimer = setInterval(function() {
                self.next();
            }, config.interval * 1000, true);
        },
        destroy: function() {
            if (this.autoplayTimer) {
                clearInterval(this.autoplayTimer);
            }
        }
    })

});