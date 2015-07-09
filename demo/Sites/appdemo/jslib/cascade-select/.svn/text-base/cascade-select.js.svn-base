/*******************************************
#   Author:hax-kazuneil@gmail.com
#   Last modified: 2013-07-25 11:47
#   Filename: cascade-select.js
#   Description:
********************************************/
/**
 * 多级联动插件
 * @memberOf M.Plugin
 * @class CascadeSelect
 * @example
 * var host = M.one('#cascade');
    host.plug(M.Plugin.CascadeSelect,{
        url: "js/moui/1.0.5/cascade-select/cascadeselect.json",
        beautify: true,
        value:['100010000','100030000','100110000']
    });
 * //参数
 * //url : 联动的请求地址
 * //beautify : 是否没话select
 * //value : 默认的值
 */
Mo.define('cascade-select', function (M) {
    M.namespace('Plugin');
    var DefaultAttrs,
        CLICK = "click",
        CHANGE = "change",
        SELECT = "select",
        OPTION = "option",
        SELECTED_INDEX = "selectedIndex",
        DEPTH = "depth",
        MaxDepth = "maxDepth",
        HOST = "host",
        VALUE = "value",
        TEMP_OPTION = "<option value={{district_code}}>{{district_name}}</option>",
        TEMP_SELECT = "<select depth={{depth}}></select>",
        Lang = M.Lang,
        NEWNODE = M.Node.create
        ;
    DefaultAttrs = {
        ioType: 'ajax',
        depth: 3,
        beautify: false
    }
    M.plugin('CascadeSelect',{
        init : function (config) {
            var self = this;
            self.config = M.merge(DefaultAttrs, config),
            self.initData();
        },
        initData: function(){
            var self = this,
                SELECTES = [],
                host = self.get(HOST);
            SELECTES.push(host);
            self.cacheData = {};
            self.defaultSet = false;
            self.initValue = host.get(VALUE);
            self.defaultValue = self.config.value;
            self.selects = SELECTES;
            self.getData();

        },
        renderData: function(data, depth){
            var self = this,curSelect,isNew,
                defaultV = '',
                prevSPAN,
                initValue = self.defaultValue,
                SELECTS = self.selects;
            SELECTS[depth] = SELECTS[depth] ||
                                SELECTS[depth - 1].next(SELECT);

            if(!SELECTS[depth] || !SELECTS[depth].hasAttribute('depth')) isNew = true;
            if(!SELECTS[depth]) {
                SELECTS[depth] = NEWNODE(TEMP_SELECT);
                SELECTS[depth - 1].insertAfter(SELECTS[depth]);
            }
            SELECTS[depth].setAttr('depth',depth);
            curSelect = SELECTS[depth];
            prevSPAN = curSelect.previous();
            //if(depth === 0) defaultV = curSelect.get(VALUE);
            curSelect.setHTML(M.Template(TEMP_OPTION)({district_code:'',district_name:'请选择'}));

            if(data && data.length){
                curSelect.setStyle('display','');
                prevSPAN && prevSPAN.hasClass('m-select') && prevSPAN.setStyle('display','inline-block');
                M.each(data,function(d){
                    curSelect.append(M.Template(TEMP_OPTION)(d));
                });
            }else{
                curSelect.setStyle('display','none');
                prevSPAN && prevSPAN.hasClass('m-select') && prevSPAN.setStyle('display','none');
            }
            //设置配置项默认value
            if(!self.defaultSet && M.Lang.isArray(initValue)){
                curSelect.set(VALUE,initValue[depth]);
                if(depth === initValue.length - 1) self.defaultSet = true;
            }
            if(isNew) {
                self.bindSelect(curSelect);
            }
            curSelect.fire(CHANGE);
            self.beautify(curSelect);

            self.selects = SELECTS;
        },
        getData: function(value, depth){
            var self = this,
                host = self.get(HOST),
                config = self.config,
                cache = self.cacheData,
                ioType = config.ioType;
            value = Lang.isString(value) ? value : self.initValue;
            depth = depth || 0;
            if(!parseInt(value)) {
                self.renderData(null,depth);
                return;
            }else if(cache[value]){
                self.renderData(cache[value],depth);
                return;
            }

            switch(ioType){
                case 'ajax':
                    M.xPost({
                        url: config.url + '?province=' + value,
                        on: {
                            success: function(res){
                                self.cacheData[value] = res.data;
                                self.renderData(res.data, depth);
                            },
                            failure: function(res){
                                M.log(res);
                            }
                        }
                    });
                    break;
                case 'jsonp':
                    break;
                default:
                    break;
            }

        },
        /**
         * 设置默认值
         * @example
         * node.setValue('a','b','c',...);
         */
        setValue: function(){
            var self = this,initValue;
            self.defaultSet = false;
            initValue = M.Array.toArray(arguments);
            if(!M.Lang.isArray(initValue)) return;

            self.defaultValue = initValue;
            self.getData(self.initValue);
        },
        /**
         * 获取选择的值
         * @return {Array} 多级联动每一级的键值对
         */
        getValue: function(){
            var self = this,value = [],
                SELECTS = self.selects;
            M.each(SELECTS,function(sel){
                var curIndex,curText,curValue;
                if(!sel) return;
                curIndex = sel.get(SELECTED_INDEX);
                curText = sel.all(OPTION).item(curIndex).getHTML();
                curValue = sel.get(VALUE);
                value.push({value:curValue,text:curText})
            });
            return value;
        },
        /**
         * 清空默认值
         */
        reset: function(){
            var self = this;
            self.defaultValue = null;
            self.getData();
        },
        bindSelect: function(select){
            var self = this,
                depth = parseInt(select.getAttr(DEPTH));

            if(!select || depth + 1 > self.config.depth || select.binded) return;


            select.on(CHANGE, function(e){
                var value = select.get(VALUE),
                    depth = parseInt(select.getAttr(DEPTH)) || 0;
                depth = depth + 1;
                if(depth<self.config.depth){
                  self.getData(value, depth);
                  //select.next().focus(); //IE7下select focus后才会马上渲染数据
                }
                self.config.changeEvent&&self.config.changeEvent.call(self,value,depth);
            });
            select.binded = true;
        },
        beautify: function(select){
            var self = this,
                beauty = self.config.beautify;
            if(!beauty) return;
            if(select.sel){
                select.sel.refresh();
            }else{
                select.plug(M.Plugin.Select);
            }

        }
    })

});
