/**
 * 扩展数组方法
 * @memberOf M
 * @namespace Array
 */
Mo.define('array', function(M) {
    var L = M.Lang;
	M.Array = {};
    /**
     * @lends M.Array
     */
    var MArray = {
        //继承至M.each
        each: M.each,
        /**
        * 数组去重操作的方法
        * @param {Array} a 需要去重的数组
        * @return {Array} 返回去重之后的数组
        * @example
        * ###js
        * var a = M.Array.dedupe(['a','a','b','b']);
        * console.log(a) //['a','b'];
        */
        dedupe: function(a) {
            var hash = {},
                results = [],
                i,
                item,
                len,
                hasOwn = HASOWN;

            for (i = 0, len = a.length; i < len; ++i) {
                item = a[i];
                if (!hasOwn.call(hash, item)) {
                    hash[item] = 1;
                    results.push(item);
                }
            }
            return results;
        },

        /**
         * 查找元素所处数组中的位置
         * @param {String} item 需要查找的元素
         * @param {Array} arr 元素是否包含的数组
         * @return {Number} 返回元素所处数组位置
         *
         * @example
         * ###js
         * var array = ['a','b',c];
         * var index = M.Array.indexOf('a',array);
         * console.log(index) //0
         */
        indexOf: Array.indexOf ?
            function(item, arr) {
                return Array.indexOf(arr, item);
            } : function(item, arr) {
                if (!arr) return;
                for (var i = 0, len = arr.length; i < len; ++i) {
                    if (arr[i] === item) {
                        return i;
                    }
                }
                return -1;
            },
        /**
         * 判断元素是否包含在数组中
         * @param {String} item 需要查找的元素
         * @param {Array} arr 元素是否包含的数组
         * @return {Boolean} 返回元素是否包含
         * @example
         * ###js
         * var array = ['a','b','c'];
         * var bo = M.Array.inArray('a',array);
         * console.log(boolean); //true
         */
        inArray: function(item, arr) {
            return MArray.indexOf(item, arr) > -1;
        },


        /**
         * 将序列化对象转化为数组的方法
         * @param {Object} arr 序列化的对象
         * @return {Array} 返回序列化后的新数组
         * @example
         * var cc = {'a':0,'b':1,'c':2};
         * var a = M.Array.toArray(cc);
         * console.log(a); //[0,1,2];
         */
        toArray: function(arr) {
            var r = [],
                i = 0,
                arr = arr || [],
                len = arr.length;
            if (L.isArray(arr)) return arr;
            for (; i < len; i++) {
                r[i] = arr[i];
            }
            return r;
        },
        /**
        *替换数组中的item,只匹配第一个
        *@param {value} oldItem  要替换的数值
        *@param {Array} newItem  新的数值
        *@param {value} arr  需要操作的数组
        *@example
        * ###JS
        * var a = ['a','b','c','a'];
        * M.Array.replaceArray('a','f',a);
        * console.log(a) //['f','b','c','a']
        */
       
        replaceArray: function(oldItem, newItem, arr) {
            for (var i = 0, m = arr.length; i < m; i++) {
                if (arr[i] == oldItem) {
                    arr.splice(i, 1, newItem);
                    break;
                }
            }
            return arr;
        },
        /**
         *删除数组中的item
         *@param {value} item 要删除的数值
         *@param {Array} arr 需要操作的数组
         *@param {Function} [fn] 数组元素需要满足的函数 参数：当前元素，要删除的元素，当前元素索引 返回值为布尔
         *@param {Boolean} [all] 是否匹配全部
         *@example
         * ###js
         * var a = [1,2,3,1];
         * M.Array.removeArray(1,a);
         * console.log(b)//[2,3,1];
         * ###js
         * var a = [1,2,3,1];
         * M.Array.removeArray(1,a,,true);
         * console.log(a)//[2,3];
         * ###js
         * var a = [1,2,3,1];
         * M.Array.removeArray(0,a,function(nitem,item,i){
         *     if(i==1){
         *         reutrn true;
         *     }
         * });
         * console.log(a)//[1,3,1];
         */
        removeArray: function(item, arr, fn, all) {
            var l = arr.length;
            for (var i = 0, m = l; i < m; i++) {
                if (arr[i] == item || fn && fn(arr[i], item, i)) {
                    arr.splice(i, 1);
                    if (all) {
                        if (i < l - 1) {
                            i--;
                        }
                        continue;
                    } else {
                        break;
                    }
                }
            }
        },
        /**
         *两个数组转化为键值对应的对象的方法
         *@example

            M.Array.hash(['a', 'b', 'c'], ['foo', 'bar']);
            // => {a: 'foo', b: 'bar', c: true}

         *@param {String[]} keys 用于构成对象的key序列.
         *@param {Array} [values] 用于构成对象value的数组.
         *@return {Object} 返回以第一个数组为key，第二个数组为值的对象,长度小于key序列时对应值为true.
        */
        hash: function(keys, values) {
            var hash = {},
                vlen = (values && values.length) || 0,
                i, len;

            for (i = 0, len = keys.length; i < len; ++i) {
                if (i in keys) {
                    hash[keys[i]] = vlen > i && i in values ? values[i] : true;
                }
            }
            return hash;
        },

        /**
         *测试对象是否为数组或类数组或两者都不属于的方法
         *@method test
         *@param {Object} obj 待测试的对象.
         *@return {Number} A 返回结果显示:

           * 0: 既不是数组也不是类数组.
           * 1: 数组.
           * 2: 类数组.
         */
        test: function(obj) {
            var result = 0;

            if (L.isArray(obj)) {
                result = 1;
            } else if (L.isObject(obj)) {
                try {
                    // indexed, but no tagName (element) or scrollTo/document (window. From DOM.isWindow test which we can't use here),
                    // or functions without apply/call (Safari
                    // HTMLElementCollection bug).
                    if ('length' in obj && !obj.tagName && !(obj.scrollTo && obj.document) && !obj.apply) {
                        result = 2;
                    }
                } catch (ex) {}
            }

            return result;
        },
        /**
         * 将多维混合数组展开成1维数组
         * @param  {Array} arr 目标数组
         * @return {Array}    返回展开后的数组
         * @example
         * var a = [[1,2,3],[4,5],6];
         * var b = M.Array.flatten(a);
         * console.log(b);//[1,2,3,4,5,6];
         */
        flatten: function(arr) {
            for (var r = [], i = 0, l = arr.length; i < l; ++i) 
            {
                if(MArray.test(arr[i])){
                    var b = MArray.flatten(arr[i]);
                    r = r.concat(b);
                }else{
                    r[r.length] = arr[i]
                }

            }
            return r
        },
        /**
         * 按照一定规则过滤数组
         * @param  {Array} arr   目标数组
         * @param  {Function} fun   过滤函数，需要返回true或false
         * @param  {Object} thisp 函数内的指针，可为空
         * @return {Array}       过滤后的数组
         */
        filter: function(arr, fun, thisp) {

            if (arr == null)
                throw new TypeError();

            var t = Object(arr);
            var len = t.length >>> 0;
            if (typeof fun != "function") {
                throw new TypeError();
            }

            var res = [];
            var thisp = arguments[1];
            for (var i = 0; i < len; i++) {
                if (i in t) {
                    var val = t[i]; // in case fun mutates this
                    if (fun.call(thisp, val, i, t))
                        res.push(val);
                }
            }

            return res;
        },

        // ES5 15.4.4.19
        // http://es5.github.com/#x15.4.4.19
        // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
        map: function map(arr, callback, thisArg) {

            var T, A, k;

            if (arr == null) {
                throw new TypeError(" this is null or not defined");
            }

            // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
            var O = Object(arr);

            // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = O.length >>> 0;

            // 4. If IsCallable(callback) is false, throw a TypeError exception.
            // See: http://es5.github.com/#x9.11
            if (typeof callback !== "function") {
                throw new TypeError(callback + " is not a function");
            }

            // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
            if (thisArg) {
                T = thisArg;
            }

            // 6. Let A be a new array created as if by the expression new Array(len) where Array is
            // the standard built-in constructor with that name and len is the value of len.
            A = new Array(len);

            // 7. Let k be 0
            k = 0;

            // 8. Repeat, while k < len
            while (k < len) {

                var kValue, mappedValue;

                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                if (k in O) {

                    // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                    kValue = O[k];

                    // ii. Let mappedValue be the result of calling the Call internal method of callback
                    // with T as the this value and argument list containing kValue, k, and O.
                    mappedValue = callback.call(T, kValue, k, O);

                    // iii. Call the DefineOwnProperty internal method of A with arguments
                    // Pk, Property Descriptor {Value: mappedValue, : true, Enumerable: true, Configurable: true},
                    // and false.

                    // In browsers that support Object.defineProperty, use the following:
                    // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });

                    // For best browser support, use the following:
                    A[k] = mappedValue;
                }
                // d. Increase k by 1.
                k++;
            }

            // 9. return A
            return A;
        }

    };
	M.extend(M.Array, MArray);
});