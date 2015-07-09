Mo.define('base', function(M) {
    var L = M.Lang,
        VALUE = 'value',
        DATA_KEY = '_$data';
    /**
     * 基础类，实现get,set方法
     * @constructor M.Base
     */
    function Base() {}

    
    M.extend(Base, /** @lends M.Base.prototype */{
        /**
         * 初始化（ATTRS）默认属性
         */
        initDataByAttrs: function() {
            // self[DATA_KEY][key] = L.clone(value);
            /*    if(value.value){
                //self[DATA_KEY][key].value = value.value;
            }*/
            //self[DATA_KEY][key] = value;

            var self = this,
                attrs = self.constructor.ATTRS;
            if (!self[DATA_KEY]) {
                self[DATA_KEY] = {};
            }

            M.each(attrs, function(obj, key) {
                self[DATA_KEY][key] =
                    L.isObject(L.clone(obj)) && !L.isUndefined(obj.value) ? obj : {
                        value: obj
                    }
            });
        },
        /**
         * 获取一个属性值
         * @param  {String} name 属性名称
         * @return {Any}    
         */
        get: function(name) {
            var d = this[DATA_KEY];
            return (d && name in d) ? (d[name]['getter'] ? d[name]['getter'].apply(this) : d[name][VALUE]) : undefined;
        },
        /**
         * 获取一组属性值
         * @param  {String} names 用逗号隔开的属性列表，如：属性1,属性2...
         * @return {Object}       键值对形式的一组值
         */
        getAttrs: function(names) {
            var vs = {},
                self = this;
            M.each(names.split(','), function(k) {
                vs[k] = self.get(k);
            });
            return vs;
        },
        // setter: function(obj) {
        //     if (!obj) return;
        //     for (var key in obj) {
        //         this.set(key, obj[key]);
        //     }
        // },
        /**
         * 设置一组属性值
         * @param {Object<{key1:value1,key2:value2}>} attrs 一组属性值
         */
        setAttrs: function(attrs) {
            var self = this;
            M.each(attrs, function(value, key) {
                self.set(key, value);
            });
        },
        /**
         * 设置一个属性值
         * @param {String}  name    属性名称
         * @param {Any}  val     属性值
         * @param {Boolean} isClone 是否强制赋值。在值是Object时有效
         */
        set: function(name, val, isClone) {
            var d = this[DATA_KEY];
            if (isClone === true) {
                val = L.clone(val);
            }
            if (!(d && d[name])) {
                d[name] = {};
            }

            if (d && name in d && d[name].readOnly == true) return this;

            if (d[name]['setter']) {
                val = d[name]['setter'].call(this, val);
            }

            d[name][VALUE] = val;
            return this;
        }
    });
    M.Base = Base;
});