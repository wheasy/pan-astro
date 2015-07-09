/**
* 节点数据缓存相关操作
*/
Mo.define('node-data', function(M) {
    var STR_DATA_PREFIX = 'data-';
    /**
     * @lends M.Node.prototype
     */
    var data = {
        _initData: function() {
            if (! ('_data' in this)) {
                this._data = {};
            }
        },
        /**
         * 获取节点缓存数据
         * @param  {String} name 缓存数据名称
         * @return {Object | String}      缓存的数据
         */
        getData: function(name) {
            this._initData();

            var data = this._data,
            ret = data;

            if (arguments.length) { // single field
                if (name in data) {
                    ret = data[name];
                } else { // initialize from HTML attribute
                    ret = this._getDataAttribute(name);
                }
            } else if (typeof data == 'object' && data !== null) { // all fields
                ret = {};
                M.each(data, function(v, n) {
                    ret[n] = v;
                });

                ret = this._getDataAttributes(ret);
            }

            return ret;
        },
        /**
         * 设置节点缓存数据
         * @param {String} name 缓存数据名称
         * @param {Object | String} val  缓存的数据
         */
        setData: function(name, val) {
            this._initData();
            if (arguments.length > 1) {
                this._data[name] = val;
            } else {
                this._data = name;
            }
            return this;
        },
        _getDataAttributes: function(ret) {
            ret = ret || {};
            var i = 0,
            attrs = this._node.attributes,
            len = attrs.length,
            prefixLength = STR_DATA_PREFIX.length,
            name;

            while (i < len) {
                name = attrs[i].name;
                if (name.indexOf(STR_DATA_PREFIX) === 0) {
                    name = name.substr(prefixLength);
                    if (! (name in ret)) { // only merge if not already stored
                        ret[name] = this._getDataAttribute(name);
                    }
                }

                i += 1;
            }

            return ret;
        },
        _getDataAttribute: function(name) {
            name = STR_DATA_PREFIX + name;

            var node = this._node,
            attrs = node.attributes,
            data = attrs && attrs[name] && attrs[name].value;

            return data;
        },
        /**
         * 清除节点缓存数据
         * @param  {String} name 缓存数据名称
         * @return {HTMLelement}      当前原生节点
         */
        clearData: function(name) {
            if ('_data' in this) {
                if (typeof name != 'undefined') {
                    delete this._data[name];
                } else {
                    delete this._data;
                }
            }

            return this;
        }
    }

    M.extend(M.Node, data);
});