//延迟加载组件
Mo.define('inscreen', function(M) {
    //参考对象[默认为页尾], 可设置节点
    var win = M.one(M.config.win),
        REGION = 'region',
        STR_DATA_SRC = 'data-src',
        L = M.Lang,
        STR_DATA_AREA = 'data-area',
        MArrary = M.Array;



    var inscreen = function() {},
        ins = new inscreen,
        /**
         * 加载图片
         */
        _loadImgSrc = function(img) {
            var dataSrc = img.getAttr(STR_DATA_SRC);
            if (dataSrc && img.getAttr('src') != dataSrc) {
                //缓存图片
                this._loadTempSrc(dataSrc,function(tempImg){
                    //img.on('load', _imgLoadedHandler, img);
                    img.setAttr("src", dataSrc);
                })
                
            }
        },
        _loadTempSrc = function(url,callback){
            var tempimg = new Image();
                tempimg.src = url;   
            if (tempimg.complete) { 
                callback(tempimg);     
                return;   
            }     
            
            tempimg.onload = function () {      
                callback(tempimg);
            }
        },
        _imgLoadedHandler = function() {
            var img = this;
            img.removeAttr(STR_DATA_SRC);
            img.removeClass('lazy-item');
            img.off('load', _imgLoadedHandler);
        },
        /**
         * 从textarea中加载内容
         */
        _loadAreaData = function(area) {
            // 采用隐藏 textarea 但不去除方式，去除会引发 Chrome 下错乱
            area.setStyle('display', 'none');
            var content = M.Node.create('<div></div>');
            area.insert(content, 'before');
            content.set("innerHTML", area.get("value"));
            //area.value = ''; // bug fix: 不能清空，否则 F5 刷新，会丢内容
        },
        /**
         * 加载内容
         * @static
         * @memberof M.inScreen
         * @example
         *
         * var imgs = M.all('img');
         * M.inScreen.parse(imgs);
         * 
         * @param {HTMLElement} target  需要加载的节点或节点组
         *
         */
        parse = function(target) {
            if (!target.getDOMNode) {
                target = M.all(target);
                target.each(function(c) {
                    parse(c);
                });
                return;
            }

            var tagname = target.get('tagName'),
                imgs = null;

            switch (tagname) {
                //本身是IMG
                case 'IMG':
                    _loadImgSrc(target);
                    break;
                    //本身的textarea
                case 'TEXTAREA':
                    //area = target.all("textarea." + STR_DATA_AREA);
                    _loadAreaData(it);
                    break;
                    //选择容器内的图片
                default:
                    imgs = M.all('[' + STR_DATA_SRC + ']', target).each(function(it) {
                        _loadImgSrc(it);
                    });
                    break;
            }
        };

    M.extend(inscreen, /** @lends M.inScreen */{
        _eventStatus: {},
        /**
         * 监控对象列表
         */
        watchList: {},
        /**
         * 监控元素变化绑定事件
         * @static
         * @example
         *
         * M.inScreen.watch(doms);
         *
         * @param {HTMLElement} it  需要加载的节点或节点组
         *
         */
        watch: function(it) {
            var self = this;
            if (it && it._nodes) {
                it.each(function(i) {
                    self.watch({
                        target: i
                    });
                });
                return;
            }
            it.container = it.container || M.one(window);
            // if (it.container) {
                // if (!self.loadItem(it, it.container.get('viewportRegion'))) {
                // it.container.on('scroll', function(evt, it){
                //     if(ins.loadItem(it, it.container.get('viewportRegion'))){
                //     }
                // },null, it);
            // }
            if (it.container) {
            // if (!self.loadItem(it, it.container.get('viewportRegion'))) {
                self.loadItem(it, it.container.get('viewportRegion'));
                var sid = M.stamp(it.container);
                self.watchList[sid] = self.watchList[sid] || [];
                self.watchList[sid].push(it);
                self.bind(it.container);
            // }
            }
        },
        /**
         * 滚动事件处理函数
         */
        _scrollHandler: function(evt) {
            var sid = M.stamp(this);
            wlist = ins.watchList[sid],
            Rgn = this.get('viewportRegion');

            var wl = [];

            M.each(wlist, function(item) {
                if (ins.loadItem(item, Rgn) !== false) {
                    wl.push(item);
                }
            });
            ins.watchList[sid] = wl;
            ins.bind(this);
        },
        loadItem: function(item, wRgn) {
            var el = item.target,
                fn = item.fn,
                wRgn = wRgn || win.get('viewportRegion'),
                line = L.isNumber(item.line) ? item.line : 200,
                rgn = el.get('region');

            if (rgn.top < wRgn.top + wRgn.height + line) {
                //底部位置
                if (wRgn.top - line < rgn.top + rgn.height) {
                    //顶部位置
                    if (fn) {
                        return fn.apply(item.ctx || el, [el, rgn, wRgn])
                    };

                    if (el.each) {
                        el.each(function(it) {
                            parse(it);
                        });
                    } else {
                        parse(el);
                    }
                    return false;
                }
            }
            return;
        },
        bind: function(scrollBox) {
            var self = this,
                sid = M.stamp(scrollBox);
            if (!self._eventStatus[sid]) {
                //未绑定scroll事件且有需要监控的对象,则绑定scroll事件
                if (self.watchList[sid].length > 0) {
                    scrollBox.on('scroll', self._scrollHandler);
                    scrollBox.on('resize', self._scrollHandler);
                    self._eventStatus[sid] = true;
                }
                //已经绑定，且无监控对象,则解绑scroll事件
            } else if (self.watchList[sid].length === 0) {
                scrollBox.off('scroll', self._scrollHandler);
                scrollBox.off('resize', self._scrollHandler);
                self._eventStatus[sid] = false;
            }
        }
    });

    ins.parse = parse;

    /** 
    * @namespace M.inScreen
    */
    M.inScreen = ins;
});