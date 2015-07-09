/**
 延迟加载组件
 *@memberOf M.Plugin
 *@class  SwitchableEffect
 *@date   2013-7-1
 *@author shenguozu
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
    }, {
        fn: M.Plugin.SwitchableEffect,
        cfg: {
            relateType: "switchable",
            effect: 'scrollX',
            duration: 0.2,
            circle: true
        }
    }]);
*/
Mo.define('switchable-effect-plugin', function(M) {

    var Effects;

    var DISPLAY = 'display';
    var BLOCK = 'block';

    var OPACITY = 'opacity';

    var ZINDEX = 'zIndex';
    var POSITION = 'position';
    var RELATIVE = 'relative';
    var ABSOLUTE = 'absolute';

    var SCROLLX = 'scrollX';
    var SCROLLY = 'scrollY';
    var SCROLLSIZEY = 'scrollSizeY';
    var SCROLLSIZEX = 'scrollSizeX';

    var NONE = 'none';
    var FADE = 'fade';
	var EASEIN = 'easeIn';
	
	var DefaultAttrs = {
        /**
         * @cfg String effect
         * 默认为none，即只是显示隐藏，目前支持的特效为scrollx、scrolly、fade或者自己直接传入特效函数。
         */
        effect: 'none',

        /**
         * @cfg Number duration 
         * 默认为.5，动画的时长。
         */
        duration: 0.5,

        /**
         * @cfg String easing
         * 默认为easeIn，即线性的。
         */
        easing: EASEIN,

        /**
         * @cfg Boolean circle
         * 默认为false，如果设置为true，最后一帧到第一帧切换的时候会更加平滑。 触摸时circle必须为false
         * 
         */
        circle: false
		
	};


    /**
     * 定义效果集
     */
    Effects = {

        // 最朴素的显示/隐藏效果
        none: function(fromPanels, toPanels, callback) {
            M.each(fromPanels, function(o,i) {
                M.one(o).setStyle(DISPLAY,NONE); 
            });
            M.each(toPanels, function(o,i) {
                M.one(o).setStyle(DISPLAY,BLOCK); 
            });
            callback();
        },

        // 淡隐淡现效果
        fade: function(fromPanels, toPanels, callback) {
            if(fromPanels.length !== 1) {
                return; //fade effect only supports step == 1.
            }
            var self = this, config = self.config,
                fromPanel = fromPanels[0], toPanel = toPanels[0];
			self.anim && self.anim.stop();

            // 首先显示下一张
            M.one(toPanel).setStyle(OPACITY, 1);

            // 动画切换
			self.anim = new M.Anim({
				'node': M.one(fromPanel),
				'to': {
					opacity: 0,
				},
				'duration': self.duration,
				'effect': self.easing
			}).on('end',function(e) {
				self.anim = null;
                // 切换 z-index
                M.one(toPanel).setStyle(ZINDEX, 9);
                M.one(fromPanel).setStyle(ZINDEX, 1);
                callback();
			});
			self.anim && self.anim.run();
        },

        // 水平/垂直滚动效果
        scroll: function(fromPanels, toPanels, callback, index, direction) {
            var self = this, config = self.config,
                isX = self.effect === SCROLLX,
				panel = self.panels.item(0),
                attributes = {};
            var first, _diff;
            if(config.circle){
                index++;
            }
            var diff = self.viewSize[isX ? 0 : 1] * index;
            //console.log(direction);
            //最后一张
            if (config.circle && index == 1 && self.activeIndex == self.viewLength-1 && direction=='next') {
                first = M.one(toPanels[0]);
                _diff = -diff;
                diff = self.viewSize[isX ? 0 : 1] * (self.viewLength+1);
            }
            //第一张
           // console.log(index+','+self.activeIndex)
            if (config.circle && index == self.viewLength && self.activeIndex == 0 && direction=='prev') {
                first = M.one(toPanels[0]);
                _diff = -diff;
                diff = 0;
            }

            attributes[isX ? 'left' : 'top'] = -diff;
            panel.diff = -diff;
			self.anim && self.anim.stop();

			self.anim = new M.Anim({
				'node': panel.ancestor(),
				'to': attributes,
				'duration': self.duration,
				'effect': self.easing
			}).on('end', function(e) {
				if(first) {
					first.ancestor().setStyle(isX ? 'left' : 'top', _diff);
                    panel.diff = _diff;
					first = null;
				}
				self.anim = null;
				callback();
			});
			self.anim && self.anim.run();
        },
        //只按照高度滚动
        scrollSize: function(fromPanels, toPanels, callback, index, direction) {
            var self = this, config = self.config,
                isX = self.effect === SCROLLSIZEX,
                panel = self.panels.item(0),
                attributes = {},
                range =  self.range;
                rangeUnit = self.rangeUnit;
            var first, _diff;
            self.viewLength = self.scrollLenght;

            var diff = range * index;
            //console.log(direction);
            //最后一张
      
            if (config.circle && index == 0 && self.activeIndex == self.viewLength-1) {
                first = M.one(toPanels[0]);
                _diff = -diff;
                diff = range * self.viewLength;
            }
            attributes[isX ? 'left' : 'top'] = -diff;
            panel.diff = -diff;
            self.anim && self.anim.stop();

            self.anim = new M.Anim({
                'node': panel.ancestor(),
                'to': attributes,
                'duration': self.duration,
                'effect': self.easing
            }).on('end', function(e) {
                if(first) {
                    first.ancestor().setStyle(isX ? 'left' : 'top', _diff);
                    panel.diff = _diff;
                    first = null;
                }
                self.anim = null;
                callback();
            });
            self.anim && self.anim.run();
        }
        
    };

    Effects[SCROLLX] = Effects[SCROLLY] = Effects.scroll;
	Effects[SCROLLSIZEY] = Effects[SCROLLSIZEX] = Effects.scrollSize;
	M.plugin('SwitchableEffect',/** *@lends M.Plugin.SwitchableEffect*/{
        /**
         * 根据 effect, 调整初始状态
         * @param {Object} config 配置项
         * 
         * @param {String} [config.effect] 默认为none，即只是显示隐藏，目前支持的特效为scrollx、scrolly、fade或者自己直接传入特效函数。
         * 
         * @param {Number} [config.duration]  默认为.5，动画的时长。
         *
         * @param {String} [config.easing] 默认为easeIn，即线性的。
         * 
         * @param {Boolean} [config.circle] 默认为false，如果设置为true，最后一帧到第一帧切换的时候会更加平滑。 触摸时circle必须为false
         * 
         *
         */
        init: function(config) {
            var config = config ? M.merge(DefaultAttrs, config) : {},
                self = this,
                host = config.host,
                effect = config.effect,
                duration = config.duration,
                easing = config.easing,
                plugHost = host[config.relateType],
                panels = plugHost.panels,
                panel = panels.item(0),
                step = plugHost.config.step,
                activeIndex = plugHost.activeIndex,
                fromIndex = activeIndex * step,
                toIndex = fromIndex + step - 1,
                panelLength = panels.size(),
                range = config.scrollRange;
                rangeUnit = config.rangeUnit;
            if(panelLength<=1){
                return;
            }
            plugHost.effect = effect;
            plugHost.rangeUnit = rangeUnit;
            plugHost.range = range;
            plugHost.duration = duration;
            plugHost.scrollLenght = config.scrollLenght;
            plugHost.easing = easing;
            // 1. 获取高宽
            plugHost.viewSize = [
                // plugHost.config.viewSize[0] || panel.get('region').width * step,
                // plugHost.config.viewSize[1] || panel.get('region').height * step
                plugHost.config.viewSize[0] * step || panel.get('region').width * step,
                plugHost.config.viewSize[1] * step || panel.get('region').height * step
            ];
            // 注：所有 panel 的尺寸应该相同
            //    最好指定第一个 panel 的 width 和 height，因为 Safari 下，图片未加载时，读取的 offsetHeight 等值会不对

            // 2. 初始化 panels 样式
            if (effect !== NONE) { // effect = scrollx, scrolly, fade
                // 这些特效需要将 panels 都显示出来
                //兼容自适应高度暂时去掉
                //panels.setStyle(DISPLAY, BLOCK);

                switch (effect) {

                    // 如果是滚动效果
                    case SCROLLSIZEY:
                    case SCROLLSIZEX:
                        //如果为循环滚动设置2个模拟幻灯
                        var length = plugHost.viewLength;
                        if(config.circle){
                            var first = panels.item(0).cloneNode(true),
                            length = length + 1;
                            first.setStyle('float', 'left');
                            panels.item(0).ancestor().append(first);
                        }

                        // 设置定位信息，为滚动效果做铺垫
                        
                        panel.ancestor().setStyle('position', ABSOLUTE);

                        panel.ancestor().ancestor().setStyle('position', RELATIVE); // 注：content 的父级不一定是 container

                        // 水平排列
                        if (effect === SCROLLSIZEY) {
                            panels.setStyle('float', 'left');
                            //panel.ancestor().setStyle('top', '-'+plugHost.range+'px');
                            // 设置最大宽度，以保证有空间让 panels 水平排布
                            //panel.ancestor().setStyle('width', plugHost.viewSize[0] * length + 'px');
                        }
                        break;
                    case SCROLLX:
                    case SCROLLY:
                        //如果为循环滚动设置2个模拟幻灯
                        var length = plugHost.viewLength;
                        if(config.circle){
                            var first = panels.item(0).cloneNode(true),
                                last = panels.item(panels.size()-1).cloneNode(true);
                            length = length + 2;
                            first.setStyle('float', 'left');
                            last.setStyle('float', 'left');
                            panels.item(0).ancestor().append(first);
                            panels.item(0).ancestor().prepend(last);
                        }

                        // 设置定位信息，为滚动效果做铺垫
                        
                        panel.ancestor().setStyle('position', ABSOLUTE);

                        panel.ancestor().ancestor().setStyle('position', RELATIVE); // 注：content 的父级不一定是 container

                        // 水平排列
                        if (effect === SCROLLX) {
                            panels.setStyle('float', 'left');
                            panel.ancestor().setStyle('left', '-'+plugHost.viewSize[0]+'px');
                            // 设置最大宽度，以保证有空间让 panels 水平排布
                            panel.ancestor().setStyle('width', plugHost.viewSize[0] * length + 'px');
                        }
                        break;

                    // 如果是透明效果，则初始化透明
                    case FADE:
                        panels.each(function(panel, index) {
                            panel.setStyles({
                                opacity: (index >= fromIndex && index <= toIndex) ? 1 : 0,
                                position: ABSOLUTE,
                                zIndex: (index >= fromIndex && index <= toIndex) ? 9 : 1
                            });        
                        });
                        break;
                }
            }

            // 3. 在 CSS 里，需要给 container 设定高宽和 overflow: hidden
            //    nav 的 cls 由 CSS 指定
            M.extend(plugHost, {
                /**
                 * 切换视图
                 * 覆盖切换方法
                 */
                _switchView: function(fromPanels, toPanels, index,direction) {
                    var self = this,
                        effect = self.effect,
                        fn = M.Lang.isFunction(effect) ? effect : Effects[effect];
                    fn.call(self, fromPanels, toPanels, function() {}, index,direction);
                },
                /**
                 * 设置偏移
                 * @method offset
                 * @return {type} [description]
                 */
                offset:function(x){
                    var self = this;
                    var panel = self.panels.item(0);
                    //self.panels.item(0).setStyle('display',BLOCK);
                    if(!panel.diff){
                        if(plugHost.config.circle){
                            panel.diff = -plugHost.viewSize[0];
                        }else{
                            panel.diff = 0;
                        }
                    }
                    panel.ancestor().setStyle('left',panel.diff+x);
                },
                /**
                 * 偏移结束
                 */
                end:function(x){
                    var self = this;
                    var panel = self.panels.item(0);
                    

                    if(Math.abs(x)>self.panels.item(0).get('region').width/3){
                        
                        if(x>0){
                            self.prev();
                            // if(panel.diff == 0){
                            //     self.rest();
                            // }else{
                            //     self.prev();
                            // }
                            
                        }else{
                            self.next();
                            // if(Math.abs(panel.diff) == panel.get('region').width*(panels.size()-1)){
                            //     self.rest();
                            // }else{
                            //     self.next();
                            // }
                           
                        }
                    }else{
                       self.rest();
                    }
                }
             
            });
        }
    });

});
