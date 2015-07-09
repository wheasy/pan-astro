Mo.define('optionlist', function(M) {
    /**
     * 美化显示列表select
     * @constructs M.OptionList
     * @example
     * M.one('#some_name').plug(M.Plugin.optionlist);
     */
    var optionlist = function() {
            optionlist.superclass.constructor.apply(this, arguments);
            //this._init.apply(this, arguments);
        },
        L = M.Lang;

    var CLS_ACTIVE = 'opt-active',
        TPL_ARRAY = '<ul>{{each list as text}}<li data-text="{{text}}" data-index="{{index}}" class="opt-data-value" data-value="{{text}}">{list}</li>{{/each}}</ul>',
        // {{if item===value && acted!=true}} {{acted = true;}}class="'+CLS_ACTIVE+'"{{/if}} 
        TPL = '<ul>{{each list as item index}}<li data-text="{{item["text"]}}" data-index="{{index}}" class="opt-data-value"  data-value="{{item["value"]}}">{list}</li>{{/each}}</ul>'; //= M.Node.create('<div class="optionlist select-suggest" style="position:absolute;z-index:100;"></div>');
    //M.one('body').append(layer);
    // item["value"] === value  && acted!=true}} {{acted = true;}}class="'+CLS_ACTIVE+'"{{/if}} 

    optionlist.ATTRS = {
        status: {
            value: 'hide'
        },
        selected: {
            setter: function(node) {

                var self = this;
                cur = self.get('selected') || self.get('layer').get('dom').all('.' + CLS_ACTIVE);

                if (cur) {
                    cur.removeClass(CLS_ACTIVE);
                }

                //无匹配用户时,设置为空
                if (node) {
                    node.addClass(CLS_ACTIVE);
                }
                return node;
            }
        }

        /*
        width: {
            getter: function() {
                // body...
            },
            setter: function() {
                // body...
            }
        }*/
    };

    M.extend(optionlist, M.EventTarget);
    M.extend(optionlist, M.Plugin.Base, {
        init: function(cfg) {
            cfg = cfg || {};
            cfg.skin = cfg.skin ? (cfg.skin + ' optionlist') : ' optionlist';
            this.set('wrap', cfg.wrap);
            this.set('targetNode', cfg.targetNode);
            if (cfg.tmpl && cfg.data) {
                this.bindSource(cfg.tmpl, cfg.data);
            }
        },

        keyHandle: function(evt) {
            var self = this;
            switch (evt.keyCode) {
                case 13:
                    if (self.enter()) {
                        evt.halt();
                    }
                    break;
                case 38:
                    //press up
                    evt.halt();
                    self.prev();
                    break;
                case 39:
                    //press right
                    break;
                case 40:
                    //press down
                    evt.halt();
                    self.next();
                    break;
                case 37:
                    //press esc
                    break;
                case 27:
                    self.hideit();
                    break;
                default:
                    break;
            }
        },
        /*
         *监听keypress事件,取消默认行为 针对firefox IE下绑定keyup和keydown不会触发keypress
         */
        _keypressListener: function(e) {
            return;
            if (!this.isShow) {
                return;
            }
            switch (e.keyCode) {
                //enter
                case 13:
                    e.halt();
                    e._event.cancelBubble = true;
                    return false;
                    //down
                case 40:
                    e.halt();
                    e._event.cancelBubble = true;
                    return false;
                    //up
                case 38:
                    e.halt();
                    e._event.cancelBubble = true;
                    return false;
            }
        },
        showit: function() {

            var self = this,
                layer = self.get('layer');
            if (!layer.get('dom')) {
                layer.render();
            }
            layer.show();

            if (this.get('afterShow')) {
                this.get('afterShow')(layer.get('dom'));
            }
            self.set('status', 'show');
            M.one(M.config.doc).on('keydown', self.keyHandle, self);
            M.one(M.config.doc).on('click', self.bodyClickHandle, self);

            // layer.body.all('li').on({
            //     mouseleave: self.itemMouseOutHandle
            // }).on('mouseenter', self.itemMouseEnterHandle, self);
        },

        bodyClickHandle: function(evt) {
            var self = this,
                li, opt,
                layer = self.get('layer');

            if (!layer.get('dom').contains(evt.target) && layer.get('dom') != evt.target) { //|| (self.get('target') && !self.get('target').contains(evt.target))
                self.hideit();
                return;
            }


            if (evt.target.get('tagName') === 'LI') {
                li = evt.target
            } else {
                //li = evt.target.ancestor('[data-value]');
                li = evt.target.ancestor('li');
            }
            if (!li) {
                return;
            }
            self.set('selected', li);
            self.fire('selected', {
                index: li.getAttr('data-index'),
                value: li.getAttr('data-value'),
                text: li.getAttr('data-text'),
                ele: li
            });

            self.enter();
        },
        itemMouseEnterHandle: function(evt) {
            var self = this,
                sel = null; //ele.ancestor().one('.'+CLS_ACTIVE);

            sel = evt.target.get('tagName') !== 'LI' ? evt.target.ancestor('li') : evt.target;

            self.set('selected', sel);
        },
        itemMouseOutHandle: function(evt) {
            var ele = this;
            ele.removeClass(CLS_ACTIVE);
        },
        hideit: function() {
            //取消绑定
            var self = this;
            layer = self.get('layer');

            if (self.get('status') === 'hide') {
                return;
            }

            self.set('status', 'hide');

            layer.hide();

            self.fire('hide');

            M.one(M.config.doc).off('click', self.bodyClickHandle);
            M.one(M.config.doc).off('keydown', self.keyHandle);

            self.off('hide');
            self.off('show');
            self.off('enter');
        },
        /*
         * 移动到上一个
         */
        next: function() {

            var self = this,
                layer = self.get('layer'),
                sel = self.get('selected'),
                f = layer.get('dom').one('.opt-data-value');

            if (!f) {
                return;
            }
            var sel = sel ? (self.get('selected').next() || f) : f;

            self.fire('selected', {
                index: sel.getAttr('data-index'),
                value: sel.getAttr('data-value'),
                text: sel.getAttr('data-text')
            });
            self.set('selected', sel);
        },
        /**
         * 移动到下一个
         */
        prev: function() {
            var self = this,
                layer = self.get('layer'),
                l = layer.get('dom').all('.opt-data-value'),
                sel = self.get('selected');
            if (l.size()) {
                l = l.item(l.size() - 1);
            } else {
                return;
            }

            var sel = sel ? (sel.previous() || l) : l;

            self.fire('selected', {
                index: sel.getAttr('data-index'),
                value: sel.getAttr('data-value'),
                text: sel.getAttr('data-text')
            });
            self.set('selected', sel);
        },
        /**
         *上屏
         */
        enter: function() {
            var self = this,
                sel = self.get('selected'),
                opt = null;
            if (sel) {
                opt = {
                    index: sel.getAttr('data-index'),
                    value: sel.getAttr('data-value'),
                    text: sel.getAttr('data-text'),
                    ele: sel
                };
                if (!(self.fire('enter', opt) === false)) {
                    self.hideit();
                }
                return true;
            }
            return false;

        },
        /**
         * 绑定事件
         * @private
         */
        bindEvent: function() {
            //
        },
        /**
         * 绑定数据源
         * @method
         */
        bindSource: function(itemTpl, data) {
            var self = this,
                content = M.Template((L.isArray(data.list) && L.isObject(data.list[0]) ? TPL : TPL_ARRAY).replace('{list}', itemTpl))(data);
            if (!self.get('layer')) {
                var layer = new M.Widget.overlay({
                    wrap: self.get('wrap'),
                    bodyContent: content,
                    width: '200px',
                    height: '100px',
                    showNode: self.get('targetNode'),
                    position: 'bottom center',
                    skin: 'select-wrap'
                });
                self.set('layer', layer);
            } else {
                //刷新

                self.get('layer').set('body', content);

            }


            self.set('data', data);

        },
        _getCurrentItem: function() {
            var self = this,
                layer = self.get('layer'),
                c = layer.get('dom').one('.' + CLS_ACTIVE);
            if (c) {
                return c;
            }
            c = layer.get('dom').one('.opt-data-value');

            if (c) {
                return c;
            }
        }
    });

    M.OptionList = optionlist;
});