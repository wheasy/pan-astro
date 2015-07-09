/**
 * 生成浮层
 * @author  wanhu
 * @mail    wanhu88@gmail.com
 * @date    2013/6/30
 * @memberOf M.Widget
 * @class overlay
 */
Mo.define('overlay', function(M) {
    var L = M.Lang,
        tpl = M.Template.get('overlay');
    var CACHE_OVERLAY = {};
    //有效位置信息
    var positionX = ['left', 'right', 'center'],
        positionY = ['top', 'bottom', 'center'];

    M.widget('overlay', {
        ATTRS: {
            // 宽
            //     width: '',
            // 高
            //     height: '',
            // skin: {},
            // left
            x: {
                setter: function(value) {
                    this['data']['x'].value = value;
                    var dom = this.get('dom');
                    dom && dom.setStyle('top', value);
                }
            },
            y: {
                setter: function(value) {
                    this['data']['y'].value = value;
                    var dom = this.get('dom');
                    dom && dom.setStyle('left', value);
                }
            },
            size: {
                getter: function() {
                    return this.getSize();
                }
            },
            body: {
                getter: function() {
                    return this.get('dom').role('body');
                },
                setter: function(value) {
                    this.set('bodyContent', value);
                    var dom = this.get('dom');
                    if (L.isString(value)) {
                        dom && dom.role('body').set('innerHTML', value);
                    } else {
                        dom && dom.empty() && dom.append(value);
                    }
                }
            },
            header: {
                getter: function() {
                    return this.get('dom').role('header');
                }
            },
            footer: {
                getter: function() {
                    return this.get('dom').role('footer');
                }
            }
            // 头内容
            //     headerContent: '',
            // body内容
            //     bodyContent: '',
            // 脚内容
            //     footer: ''
        },
        init: function(cfg) {
            var self = this;
            M.each(cfg, function(v, p) {
                self.set(p, v);
            });
            var stamp = M.stamp(this);
            CACHE_OVERLAY[stamp] = this;

            //定位相关
            self.set('showNode', cfg.showNode || null);
            self.set('offsetX', cfg.offsetX || 0);
            self.set('offsetY', cfg.offsetY || 0);
            self.set('afterShow', cfg.afterShow || null);
            cfg.position && self._setPostionWithString(cfg.position);
            self.set('position', cfg.position || null);
        },
        render: function() {
            var self = this,
                bodyIsDom = !L.isString(self.get('bodyContent')),
                dom = tpl({
                    wrap: !!self.get('wrap'),
                    skin: self.get('skin'),
                    header: self.get('headerContent'),
                    footer: self.get('footerContent'),
                    body: bodyIsDom ? "  " : self.get('bodyContent')
                });

            dom = M.Node.create(dom);
            if (bodyIsDom) {
                dom.role('body').setHTML(self.get('bodyContent'));
            }
            self.set('dom', dom);
            self.resetPosition();
            if (self.get('wrap')) {
                self.get('wrap').setHTML(dom);
            } else {
                L.templayer(dom);
            }
            self.status = 'ready';

            self.fire('ready');
        },
        setXY: function(xy) {
            if(this.get('skin')){
                return;
            }
            var styles = {};
            !L.isUndefined(xy.x) && (styles['left'] = xy.x);
            !L.isUndefined(xy.y) && (styles['top'] = xy.y);
            this.get('dom').setStyles(styles);
        },
        getSize: function() {
            var self = this,
                dom = self.get('dom'),
                size, reg;
            if (!dom) {
                return {
                    width: self.get("width"),
                    height: self.get("height")
                };
            }

            if (dom.getStyle('display') == 'none') {
                var oldLeft = dom.getStyle('left');
                var borderLeftWidth = parseInt(self.get('dom').getStyle('borderLeftWidth') || 0),
                    borderRightWidth = parseInt(self.get('dom').getStyle('borderRightWidth') || 0),
                    borderTopWidth = parseInt(self.get('dom').getStyle('borderTopWidth') || 0),
                    borderBottomWidth = parseInt(self.get('dom').getStyle('borderBottomWidth') || 0);
                dom.setStyles({
                    left: '-9999px',
                    display: 'block'
                });
                reg = dom.get('region');
                size = {
                    width: reg.width,
                    height: reg.height,
                    realyWidth: reg.width - borderLeftWidth - borderRightWidth,
                    realyHeight: reg.height - borderTopWidth - borderBottomWidth
                };
                dom.setStyles({
                    left: oldLeft,
                    display: 'none'
                });
                return size
            }
            reg = dom.get('region');
            return {
                width: reg.width,
                height: reg.height
            };
        },
        resetPosition: function() {
            if(this.get('skin')){
                return;
            }
            var self = this,
                styles = {},
                stylesMain;
            self.get('width') && (styles['width'] = self.get('width'));
            self.get('height') && (styles['height'] = self.get('height'));
            self.get('x') && (styles['top'] = self.get('x'));
            self.get('y') && (styles['top'] = self.get('y'));

            self.get('dom').setStyles(styles);
        },
        /**
         * 通过pos类设置位置
         * @method _setPostionWithPos
         * @param  pos pos pos类
         */
        _setPostionWithPos: function(pos) {
            //获取弹层的宽高
            var width = this.getSize().width,
                height = this.getSize().height;

            //获取基准节点的宽高,xy
            var targetNode = this.get('showNode'),
                targetSize = M.one(targetNode).get('region');
            targetX = targetSize.left,
                targetY = targetSize.top,
                targetWidth = targetSize.width,
                targetHeight = targetSize.height;
            //获取偏移量
            var offsetX = this.get('offsetX'),
                offsetY = this.get('offsetY');
            switch (pos.x) {
                case 'left':
                    showX = targetX - width + offsetX;
                    break;
                case 'right':
                    showX = targetX + targetWidth - offsetX;
                    break;
                case 'center':
                    showX = (targetWidth - width) / 2 + targetX + offsetX;
                    break;
            }

            switch (pos.y) {
                case 'bottom':
                    showY = targetY + targetHeight - offsetY;
                    break;
                case 'top':
                    showY = targetY - height + offsetY;
                    break;
                case 'center':
                    showY = (targetHeight - height) / 2 + offsetY + targetY;
                    break;
            }
            this.setXY({
                x: showX,
                y: showY
            });
        },
        /**
         * 通过字符串设置位置
         * @method _setPostionWithString
         * @param  string  string 位置信息
         */
        _setPostionWithString: function(string) {
            var pos = this.praseStringToPos(string);
            this.set('pos', pos);
        },
        /**
         * 解析字符串到pos类
         * @method praseStringToPos
         * @param  String          string 字符串位置信息
         * @return pos             pos   pos类信息
         */
        praseStringToPos: function(string) {
            var position = string.split(" "),
                pos = {};
            if (position.length != 2) {
                M.log('error', 'overlay-postion:位置参数必须为2，或空');
                return;
            };
            if (position[0] == 'center' && position[1] == 'center') {
                M.log('error', 'overlay-postion:两个参数不能都为center');
                return;
            }

            for (var i = position.length - 1; i >= 0; i--) {

                if (M.Array.inArray(position[i], positionX) && position[i] != 'center') {
                    pos.x = position[i];
                } else if (M.Array.inArray(position[i], positionY) && position[i] != 'center') {
                    pos.y = position[i];
                }
            }
            for (var i = position.length - 1; i >= 0; i--) {

                if (position[i] == 'center') {
                    pos.x = pos.x || position[i];
                    pos.y = pos.y || position[i];
                }

            }

            return pos;
        },
        /**
         * 显示
         * @method show
         * @return {type} [description]
         */
        show: function() {
            var self = this;

            if (self.fire('beforeShow') != false) {
                if (self.get('position')) {
                    self._setPostionWithPos(self.get('pos'));
                }
                this.get('dom').show();
            }

        },
        hide: function() {
            this.get('dom').hide();
        },
        destroy: function() {
            this.get('dom').remove();
            delete CACHE_OVERLAY[M.stamp(this)];
        }
    });
});