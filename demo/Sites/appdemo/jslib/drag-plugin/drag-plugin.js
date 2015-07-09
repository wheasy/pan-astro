/**
 * @memberOf M.Plugin
 * @class Drag
 * @author	shenguozu
 * @date 2013/7/8
 *
 * @example
 * 参数
 * boundary 边界节点选择器
 * direction 移动方向默认为xy,可选xy,x,y
 * 可触发事件
 * drag:start 拖拽开始
 * drag:end  拖拽结束
 	* drag    拖拽中
 * ###js
 * //绑定插件及配置想
 * var demo = M.one('#demo');
 * demo.plug(M.Plugin.Drag, {
 *	    boundary: '#boundary',
 *	    direction: '', //x,y
 * })
 * //绑定事件
 * demo.Drag.on('drag:start',function(e){
 *	
 * });
 * 
 */
Mo.define('drag-plugin', function(M) {
	M.namespace('Plug');

	var Lang = M.Lang,
		ATTRS = {},
		DIRECTION = "direction",
		CLSDRAGABLE = "clsDragable",
		POSITION = "position",
		LEFT = "left",
		TOP = "top",
		REGION = "region",
		EVT_DRAGSTART = "drag:start",
		EVT_DRAGEND = "drag:end",
		EVT_DRAG = "drag",
		ON = "on",
		OFF = "off",
		RELATIVE = "relative",
		ABSOLUTE = "absolute";
	ATTRS = {
		'DIRECTION':'xy',
		'CLSDRAGABLE':'moui-dragable'
	}
	M.plugin('Drag', /** @lends M.Plugin.Drag.prototype*/{
        init: function (config) {
            var self = this;
			self.cfg = M.merge(ATTRS,config);
			self.bindDrag();
        },
		bindDrag: function(){
			var self = this,
				host = self.cfg.host,
				dragX,dragY;
			self.canDrag = false;
			self.dragSwitch = ON;
			host.addClass(self.cfg.clsDragable);
			host.on({
				'mousedown': function(e){
					e.halt();
					if(self.dragSwitch === OFF) return;
					self.canDrag = true;
					self.start = {
									x: e.clientX,
									y: e.clientY
								};
					self.cLeft = host.get(REGION).left,
					self.cTop = host.get(REGION).top;
				}
			});
			
			M.one(document).on({
				'mousemove': function(e){
					if(!self.canDrag) return;
					e.halt();
					var direction = self.cfg.direction,
						interval = self.getInterval();
					self.dragging = true;
					self.fire(EVT_DRAGSTART, e);
					var xRange=0,yRange=0;
					self.end = {
						x: e.clientX,
						y: e.clientY
					};
					xRange = self.end.x - self.start.x;
					yRange = self.end.y - self.start.y;
					dragX = self.cLeft + xRange;
					dragY = self.cTop + yRange;
					if(interval){
						if(dragX < interval.min.x) {
							dragX = interval.min.x;
						}else if(dragX > interval.max.x) {
							dragX = interval.max.x;
						}
						if(dragY < interval.min.y) {
							dragY = interval.min.y;
						}else if(dragY > interval.max.y) {
							dragY = interval.max.y;
						}
					}
					if(direction !== 'y'){
						//host.setStyle(LEFT, dragX + 'px');
						host.setX(dragX);
					}
					if(direction !== 'x'){
						//host.setStyle(TOP, dragY + 'px');
						host.setY(dragY);
					}

					self.fire(EVT_DRAG, e);

				},
				'mouseup': function(e) {
					self.canDrag = false;
					if(self.dragging){
						self.fire(EVT_DRAGEND, e);
						self.dragging = false;
					}
				}
			});

		},
		scrollTo:function(o){
			var self=this,direction = self.cfg.direction,
						interval = self.getInterval();
					self.dragging = true;
					var xRange=0,yRange=0;
					self.cLeft=self.cfg.host.get(REGION).left,
					self.cTop = self.cfg.host.get(REGION).top;
					if(!self.start){
						self.start = {
									x: 0,
									y: 0
								};
					}

					xRange = o;
					yRange = o;
					dragX = self.cLeft + xRange;
					dragY = self.cTop + yRange;
					if(interval){
						if(dragX < interval.min.x) {
							dragX = interval.min.x;
						}else if(dragX > interval.max.x) {
							dragX = interval.max.x;
						}
						if(dragY < interval.min.y) {
							dragY = interval.min.y;
						}else if(dragY > interval.max.y) {
							dragY = interval.max.y;
						}
					}
					if(direction !== 'y'){
						self.cfg.host.setX(dragX);
					}
					if(direction !== 'x'){
						self.cfg.host.setY(dragY);
					}
		},
		getInterval: function(){
			var self = this,
				cfg = self.cfg,
				host = cfg.host,
				boundary = cfg.boundary,
				interval;

			boundary = Lang.isString(boundary) ? M.one(boundary) : boundary;

			if(boundary){
				var bRegion = boundary.get(REGION),region = host.get(REGION),
					bLeft = bRegion.left,left = region.left,
					bRight = bRegion.right,right = region.right,
					bTop = bRegion.top,top = region.top,
					bBottom = bRegion.bottom, bottom = region.bottom,
					minCoord,maxCoord;
					
				interval = {
					min:{x:bLeft, y:bTop},
					max:{x:bRight - region.width, y:bBottom - region.height}
				}
			}
			return interval;
		},
		/**
		 * 关闭拖拽功能
		 * @example
		 * ###JS
		 * demo.Drag.turnOff();
		 */
		turnOff: function(){
			this.dragSwitch = OFF;  
		},
		/**
		 * 开启拖拽功能
		 * @example
		 * ###JS
		 * demo.Drag.turnOn();
		 */
		turnOn: function(){
			this.dragSwitch = ON;  
		}
    });
});
